import { chooseMove, type Difficulty } from './cpu';
import type { Position } from './game';

self.onmessage = ({ data }: MessageEvent<{ position: Position; difficulty: Difficulty }>) => {
  self.postMessage(chooseMove(data.position, data.difficulty));
};
