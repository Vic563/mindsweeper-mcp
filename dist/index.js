#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { MinesweeperGame } from './minesweeper.js';
class MinesweeperMCPServer {
    server;
    game;
    constructor() {
        this.game = new MinesweeperGame();
        this.server = new Server({
            name: 'minesweeper-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'create_board',
                        description: 'Create a new Minesweeper board with specified dimensions and mine count',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'Unique identifier for the board',
                                },
                                width: {
                                    type: 'number',
                                    description: 'Width of the board (number of columns)',
                                    minimum: 1,
                                    maximum: 50,
                                },
                                height: {
                                    type: 'number',
                                    description: 'Height of the board (number of rows)',
                                    minimum: 1,
                                    maximum: 50,
                                },
                                mineCount: {
                                    type: 'number',
                                    description: 'Number of mines to place on the board',
                                    minimum: 0,
                                },
                            },
                            required: ['id', 'width', 'height', 'mineCount'],
                        },
                    },
                    {
                        name: 'reveal_cell',
                        description: 'Reveal a cell on the Minesweeper board',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                boardId: {
                                    type: 'string',
                                    description: 'ID of the board',
                                },
                                x: {
                                    type: 'number',
                                    description: 'X coordinate (column) of the cell to reveal',
                                    minimum: 0,
                                },
                                y: {
                                    type: 'number',
                                    description: 'Y coordinate (row) of the cell to reveal',
                                    minimum: 0,
                                },
                            },
                            required: ['boardId', 'x', 'y'],
                        },
                    },
                    {
                        name: 'flag_cell',
                        description: 'Flag or unflag a cell on the Minesweeper board',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                boardId: {
                                    type: 'string',
                                    description: 'ID of the board',
                                },
                                x: {
                                    type: 'number',
                                    description: 'X coordinate (column) of the cell to flag',
                                    minimum: 0,
                                },
                                y: {
                                    type: 'number',
                                    description: 'Y coordinate (row) of the cell to flag',
                                    minimum: 0,
                                },
                            },
                            required: ['boardId', 'x', 'y'],
                        },
                    },
                    {
                        name: 'get_board',
                        description: 'Get the current state and visual representation of a Minesweeper board',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                boardId: {
                                    type: 'string',
                                    description: 'ID of the board to display',
                                },
                            },
                            required: ['boardId'],
                        },
                    },
                    {
                        name: 'list_boards',
                        description: 'List all active Minesweeper boards',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'delete_board',
                        description: 'Delete a Minesweeper board',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                boardId: {
                                    type: 'string',
                                    description: 'ID of the board to delete',
                                },
                            },
                            required: ['boardId'],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'create_board': {
                        const { id, width, height, mineCount } = args;
                        const board = this.game.createBoard(id, width, height, mineCount);
                        const display = this.game.getBoardDisplay(id);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Successfully created Minesweeper board '${id}'!\n\n${display}\n\nLegend:\n. = Hidden cell\nF = Flagged cell\n* = Mine (revealed)\n1-8 = Number of neighboring mines\n(space) = Empty cell with no neighboring mines`,
                                },
                            ],
                        };
                    }
                    case 'reveal_cell': {
                        const { boardId, x, y } = args;
                        const board = this.game.revealCell(boardId, x, y);
                        const display = this.game.getBoardDisplay(boardId);
                        let message = `Revealed cell at (${x}, ${y})\n\n${display}`;
                        if (board.gameState === 'won') {
                            const duration = board.endTime ? Math.round((board.endTime - board.startTime) / 1000) : 0;
                            message += `\n🎉 Congratulations! You won in ${duration} seconds!`;
                        }
                        else if (board.gameState === 'lost') {
                            message += `\n💥 Game Over! You hit a mine at (${x}, ${y}).`;
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: message,
                                },
                            ],
                        };
                    }
                    case 'flag_cell': {
                        const { boardId, x, y } = args;
                        this.game.flagCell(boardId, x, y);
                        const display = this.game.getBoardDisplay(boardId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Toggled flag at cell (${x}, ${y})\n\n${display}`,
                                },
                            ],
                        };
                    }
                    case 'get_board': {
                        const { boardId } = args;
                        const display = this.game.getBoardDisplay(boardId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: display,
                                },
                            ],
                        };
                    }
                    case 'list_boards': {
                        const boards = this.game.getAllBoards();
                        if (boards.length === 0) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: 'No active Minesweeper boards found.',
                                    },
                                ],
                            };
                        }
                        let message = `Active Minesweeper Boards (${boards.length}):\n\n`;
                        for (const board of boards) {
                            const duration = board.endTime
                                ? Math.round((board.endTime - board.startTime) / 1000)
                                : Math.round((Date.now() - board.startTime) / 1000);
                            message += `• ${board.id}: ${board.width}x${board.height}, ${board.mineCount} mines, ${board.gameState}`;
                            if (board.gameState !== 'playing') {
                                message += ` (${duration}s)`;
                            }
                            message += '\n';
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: message,
                                },
                            ],
                        };
                    }
                    case 'delete_board': {
                        const { boardId } = args;
                        const deleted = this.game.deleteBoard(boardId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: deleted
                                        ? `Successfully deleted board '${boardId}'.`
                                        : `Board '${boardId}' not found.`,
                                },
                            ],
                        };
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Minesweeper MCP server running on stdio');
    }
}
const server = new MinesweeperMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map