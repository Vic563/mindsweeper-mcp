export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  x: number;
  y: number;
}

export interface GameBoard {
  id: string;
  width: number;
  height: number;
  mineCount: number;
  cells: Cell[][];
  gameState: 'playing' | 'won' | 'lost';
  startTime: number;
  endTime?: number;
}

export class MinesweeperGame {
  private boards: Map<string, GameBoard> = new Map();

  createBoard(id: string, width: number, height: number, mineCount: number): GameBoard {
    if (width < 1 || height < 1) {
      throw new Error('Board dimensions must be at least 1x1');
    }
    if (mineCount < 0 || mineCount >= width * height) {
      throw new Error('Mine count must be between 0 and total cells - 1');
    }

    const cells: Cell[][] = [];
    
    // Initialize empty board
    for (let y = 0; y < height; y++) {
      cells[y] = [];
      for (let x = 0; x < width; x++) {
        cells[y][x] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
          x,
          y
        };
      }
    }

    // Place mines randomly
    const minePositions = this.generateMinePositions(width, height, mineCount);
    for (const [x, y] of minePositions) {
      cells[y][x].isMine = true;
    }

    // Calculate neighbor mine counts
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!cells[y][x].isMine) {
          cells[y][x].neighborMines = this.countNeighborMines(cells, x, y, width, height);
        }
      }
    }

    const board: GameBoard = {
      id,
      width,
      height,
      mineCount,
      cells,
      gameState: 'playing',
      startTime: Date.now()
    };

    this.boards.set(id, board);
    return board;
  }

  private generateMinePositions(width: number, height: number, mineCount: number): [number, number][] {
    const positions: [number, number][] = [];
    const totalCells = width * height;
    const usedPositions = new Set<string>();

    while (positions.length < mineCount) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      const x = randomIndex % width;
      const y = Math.floor(randomIndex / width);
      const key = `${x},${y}`;

      if (!usedPositions.has(key)) {
        usedPositions.add(key);
        positions.push([x, y]);
      }
    }

    return positions;
  }

  private countNeighborMines(cells: Cell[][], x: number, y: number, width: number, height: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && cells[ny][nx].isMine) {
          count++;
        }
      }
    }
    return count;
  }

  revealCell(boardId: string, x: number, y: number): GameBoard {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board with id ${boardId} not found`);
    }
    if (board.gameState !== 'playing') {
      throw new Error('Game is already finished');
    }
    if (x < 0 || x >= board.width || y < 0 || y >= board.height) {
      throw new Error('Invalid cell coordinates');
    }

    const cell = board.cells[y][x];
    if (cell.isRevealed || cell.isFlagged) {
      return board; // Already revealed or flagged
    }

    if (cell.isMine) {
      // Game over
      cell.isRevealed = true;
      board.gameState = 'lost';
      board.endTime = Date.now();
      // Reveal all mines
      for (let row of board.cells) {
        for (let c of row) {
          if (c.isMine) {
            c.isRevealed = true;
          }
        }
      }
    } else {
      // Reveal cell and potentially cascade
      this.revealCellRecursive(board, x, y);
      
      // Check win condition
      if (this.checkWinCondition(board)) {
        board.gameState = 'won';
        board.endTime = Date.now();
      }
    }

    return board;
  }

  private revealCellRecursive(board: GameBoard, x: number, y: number): void {
    if (x < 0 || x >= board.width || y < 0 || y >= board.height) return;
    
    const cell = board.cells[y][x];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    // If cell has no neighboring mines, reveal all neighbors
    if (cell.neighborMines === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          this.revealCellRecursive(board, x + dx, y + dy);
        }
      }
    }
  }

  private checkWinCondition(board: GameBoard): boolean {
    for (let row of board.cells) {
      for (let cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  }

  flagCell(boardId: string, x: number, y: number): GameBoard {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board with id ${boardId} not found`);
    }
    if (board.gameState !== 'playing') {
      throw new Error('Game is already finished');
    }
    if (x < 0 || x >= board.width || y < 0 || y >= board.height) {
      throw new Error('Invalid cell coordinates');
    }

    const cell = board.cells[y][x];
    if (cell.isRevealed) {
      throw new Error('Cannot flag a revealed cell');
    }

    cell.isFlagged = !cell.isFlagged;
    return board;
  }

  getBoard(boardId: string): GameBoard | undefined {
    return this.boards.get(boardId);
  }

  getAllBoards(): GameBoard[] {
    return Array.from(this.boards.values());
  }

  deleteBoard(boardId: string): boolean {
    return this.boards.delete(boardId);
  }

  getBoardDisplay(boardId: string): string {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board with id ${boardId} not found`);
    }

    let display = `Minesweeper Board: ${boardId}\n`;
    display += `Size: ${board.width}x${board.height}, Mines: ${board.mineCount}\n`;
    display += `Status: ${board.gameState}\n`;
    
    if (board.endTime) {
      const duration = Math.round((board.endTime - board.startTime) / 1000);
      display += `Duration: ${duration}s\n`;
    }
    
    display += '\n';

    // Add column numbers
    display += '   ';
    for (let x = 0; x < board.width; x++) {
      display += (x % 10).toString().padStart(2);
    }
    display += '\n';

    for (let y = 0; y < board.height; y++) {
      display += y.toString().padStart(2) + ' ';
      for (let x = 0; x < board.width; x++) {
        const cell = board.cells[y][x];
        let symbol = '.';
        
        if (cell.isFlagged) {
          symbol = 'F';
        } else if (cell.isRevealed) {
          if (cell.isMine) {
            symbol = '*';
          } else if (cell.neighborMines > 0) {
            symbol = cell.neighborMines.toString();
          } else {
            symbol = ' ';
          }
        }
        
        display += symbol.padStart(2);
      }
      display += '\n';
    }

    return display;
  }
}