import { GameState, Question } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { checkMaxPlayers, incrementUsage } from './planService';
import { transitionAllowed, scoreAnswer } from './gameLogic';

export async function createGameSession(hostId: string, quizId: string, maxPlayers: number) {
  await checkMaxPlayers(hostId, maxPlayers);
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, ownerId: hostId },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) throw new Error('Quiz not found');
  await validateQuizHasSnapshot(quiz.questions);
  const code = await generateGameCode();
  const game = await prisma.gameSession.create({
    data: {
      quizId,
      hostId,
      code,
      settings: { maxPlayers },
      quizSnapshot: quiz,
    },
  });
  await incrementUsage(hostId, 'gamesHostedCount');
  return game;
}

async function generateGameCode() {
  while (true) {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();
    const existing = await prisma.gameSession.findUnique({ where: { code } });
    if (!existing) return code;
  }
}

export async function joinGame(code: string, nickname: string, userId?: string) {
  const game = await prisma.gameSession.findUnique({ where: { code }, include: { players: true } });
  if (!game) throw new Error('Game not found');
  if (game.state !== 'LOBBY') throw new Error('Game already started');
  const currentCount = game.players.length;
  if (currentCount >= (game.settings as any).maxPlayers) {
    throw new Error('Game is full');
  }
  const player = await prisma.playerSession.create({
    data: {
      gameId: game.id,
      userId,
      nickname,
    },
  });
  return player;
}

export async function transitionGame(gameId: string, nextState: GameState) {
  const game = await prisma.gameSession.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Game not found');
  if (!transitionAllowed(game.state, nextState)) {
    throw new Error(`Invalid transition from ${game.state} to ${nextState}`);
  }
  return prisma.gameSession.update({
    where: { id: gameId },
    data: {
      state: nextState,
      startedAt: nextState === 'IN_PROGRESS' ? new Date() : game.startedAt,
      endedAt: nextState === 'COMPLETED' || nextState === 'ABORTED' ? new Date() : game.endedAt,
    },
  });
}

export async function submitAnswer(playerId: string, questionIndex: number, optionId: string) {
  const player = await prisma.playerSession.findUnique({
    where: { id: playerId },
    include: { game: { include: { quiz: { include: { questions: { include: { options: true } } } } } } },
  });
  if (!player) throw new Error('Player not found');
  const questions = player.game.quiz.questions;
  if (!questions[questionIndex]) throw new Error('Invalid question index');
  const scoring = scoreAnswer(questions[questionIndex], optionId);
  const updated = await prisma.playerSession.update({
    where: { id: player.id },
    data: {
      score: player.score + scoring.delta,
      correctAnswers: player.correctAnswers + (scoring.isCorrect ? 1 : 0),
    },
  });
  return { isCorrect: scoring.isCorrect, player: updated };
}

async function validateQuizHasSnapshot(questions: Question[]) {
  if (!questions.length) {
    throw new Error('Quiz requires at least one question');
  }
}
