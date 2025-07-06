# Testing the Minesweeper MCP Server

This file shows example interactions with the Minesweeper MCP server.

## Example Game Session

### 1. Create a small board for testing
```
Tool: create_board
Parameters:
{
  "id": "test-game",
  "width": 8,
  "height": 8,
  "mineCount": 10
}
```

### 2. Reveal a cell in the center
```
Tool: reveal_cell
Parameters:
{
  "boardId": "test-game",
  "x": 4,
  "y": 4
}
```

### 3. Flag a suspicious cell
```
Tool: flag_cell
Parameters:
{
  "boardId": "test-game",
  "x": 0,
  "y": 0
}
```

### 4. Check the board state
```
Tool: get_board
Parameters:
{
  "boardId": "test-game"
}
```

### 5. List all active boards
```
Tool: list_boards
Parameters: {}
```

## Different Board Sizes

### Beginner (9x9, 10 mines)
```
Tool: create_board
Parameters:
{
  "id": "beginner",
  "width": 9,
  "height": 9,
  "mineCount": 10
}
```

### Intermediate (16x16, 40 mines)
```
Tool: create_board
Parameters:
{
  "id": "intermediate",
  "width": 16,
  "height": 16,
  "mineCount": 40
}
```

### Expert (30x16, 99 mines)
```
Tool: create_board
Parameters:
{
  "id": "expert",
  "width": 30,
  "height": 16,
  "mineCount": 99
}
```

### Custom Large Board
```
Tool: create_board
Parameters:
{
  "id": "mega",
  "width": 25,
  "height": 25,
  "mineCount": 125
}
```

## Game Strategy Tips

1. **Start in corners or edges** - These cells have fewer neighbors, making them safer initial choices
2. **Look for patterns** - Numbers tell you exactly how many mines are adjacent
3. **Use flags wisely** - Flag cells you're certain contain mines to avoid accidental clicks
4. **Process of elimination** - If a numbered cell has the right number of flags around it, you can safely reveal the remaining adjacent cells

## Board Reading Guide

```
Minesweeper Board: example
Size: 8x8, Mines: 10
Status: playing

    0 1 2 3 4 5 6 7
 0  . . . . . . . .
 1  . . . . . . . .
 2  . . . 1 2 . . .
 3  . . . . 1 . . .
 4  . . . . . . . .
 5  . . . . . . . .
 6  . . . . . . . .
 7  . . . . . . . .
```

- Coordinates are (x, y) where x is column and y is row
- Cell (3,2) shows "1" meaning it has 1 mine in its 8 neighboring cells
- Cell (4,2) shows "2" meaning it has 2 mines in its 8 neighboring cells
- Use these numbers to deduce where mines are located!