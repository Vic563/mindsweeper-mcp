# Minesweeper MCP Server

A Model Context Protocol (MCP) server that provides Minesweeper game functionality. Users can create custom-sized Minesweeper boards and play the classic game through AI assistants.

## Features

- **Custom Board Sizes**: Create Minesweeper boards of any size (up to 50x50)
- **Flexible Mine Count**: Set any number of mines (within reasonable limits)
- **Multiple Games**: Manage multiple concurrent game boards
- **Visual Display**: ASCII art representation of the game board
- **Game State Tracking**: Win/loss detection and timing
- **Cell Operations**: Reveal cells, flag/unflag suspected mines

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript code:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Available Tools

### `create_board`
Create a new Minesweeper board with custom dimensions and mine count.

**Parameters:**
- `id` (string): Unique identifier for the board
- `width` (number): Number of columns (1-50)
- `height` (number): Number of rows (1-50)
- `mineCount` (number): Number of mines to place

**Example:**
```
Create a 10x10 board with 15 mines, ID "game1"
```

### `reveal_cell`
Reveal a cell on the board. If it's a mine, the game ends. If it's empty, adjacent cells may be automatically revealed.

**Parameters:**
- `boardId` (string): ID of the board
- `x` (number): Column coordinate (0-based)
- `y` (number): Row coordinate (0-based)

**Example:**
```
Reveal cell at position (5, 3) on board "game1"
```

### `flag_cell`
Flag or unflag a cell as a suspected mine.

**Parameters:**
- `boardId` (string): ID of the board
- `x` (number): Column coordinate (0-based)
- `y` (number): Row coordinate (0-based)

**Example:**
```
Flag cell at position (2, 7) on board "game1"
```

### `get_board`
Display the current state of a board.

**Parameters:**
- `boardId` (string): ID of the board to display

### `list_boards`
List all active game boards with their status.

**Parameters:** None

### `delete_board`
Delete a game board.

**Parameters:**
- `boardId` (string): ID of the board to delete

## Game Symbols

- `.` = Hidden cell
- `F` = Flagged cell
- `*` = Mine (revealed when game ends)
- `1-8` = Number of neighboring mines
- ` ` (space) = Empty cell with no neighboring mines

## Example Game Flow

1. **Create a board:**
   ```
   create_board with id="easy", width=9, height=9, mineCount=10
   ```

2. **Start revealing cells:**
   ```
   reveal_cell on board="easy" at x=4, y=4
   ```

3. **Flag suspected mines:**
   ```
   flag_cell on board="easy" at x=0, y=0
   ```

4. **Check board status:**
   ```
   get_board for boardId="easy"
   ```

5. **Continue until you win or hit a mine!**

## Game Rules

- **Objective**: Reveal all cells that don't contain mines
- **Winning**: Reveal all non-mine cells
- **Losing**: Reveal a cell containing a mine
- **Numbers**: Show count of mines in the 8 adjacent cells
- **Flagging**: Mark cells you suspect contain mines (prevents accidental revelation)
- **Auto-reveal**: When you reveal an empty cell (0 neighbors), all adjacent cells are automatically revealed

## Development

### Project Structure
```
src/
├── index.ts          # Main MCP server implementation
└── minesweeper.ts    # Core game logic and types
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm start` - Run the compiled server

## Integration with AI Assistants

This MCP server can be integrated with AI assistants that support the Model Context Protocol, such as Claude Desktop. The AI can help you:

- Create boards with optimal mine distributions
- Suggest strategic moves
- Analyze board patterns
- Track multiple games simultaneously

## License

MIT License - feel free to use and modify as needed!