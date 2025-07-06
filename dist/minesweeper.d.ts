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
export declare class MinesweeperGame {
    private boards;
    createBoard(id: string, width: number, height: number, mineCount: number): GameBoard;
    private generateMinePositions;
    private countNeighborMines;
    revealCell(boardId: string, x: number, y: number): GameBoard;
    private revealCellRecursive;
    private checkWinCondition;
    flagCell(boardId: string, x: number, y: number): GameBoard;
    getBoard(boardId: string): GameBoard | undefined;
    getAllBoards(): GameBoard[];
    deleteBoard(boardId: string): boolean;
    getBoardDisplay(boardId: string): string;
}
//# sourceMappingURL=minesweeper.d.ts.map