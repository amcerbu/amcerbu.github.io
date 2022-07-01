size = 20;

orientation = 0;

const pieceTypes = { O : 0, I : 1, S : 2, Z : 3, T : 4, L : 5, J : 6, Shadow : 7, Air : 8, Brick : 9 }
pieceShapes = {};
pieceShapes[pieceTypes.O] = [ [[1,0],[0,1],[1,1]] ];
pieceShapes[pieceTypes.I] = [ [[-1,0],[1,0],[2,0]], [[0,-1],[0,1],[0,2]] ];
pieceShapes[pieceTypes.S] = [ [[1,0],[0,1],[-1,1]], [[0,-1],[1,0],[1,1]] ];
pieceShapes[pieceTypes.Z] = [ [[-1,0],[0,1],[1,1]], [[1,-1],[1,0],[0,1]] ];
pieceShapes[pieceTypes.T] = [ [[-1,0],[1,0],[0,1]], [[0,-1],[1,0],[0,1]], [[-1,0],[0,-1],[1,0]], [[0,-1],[-1,0],[0,1]] ];
pieceShapes[pieceTypes.L] = [ [[-1,0],[1,0],[-1,1]], [[0,-1],[0,1],[1,1]], [[1,-1],[1,0],[-1,0]], [[-1,-1],[0,-1],[0,1]] ];
pieceShapes[pieceTypes.J] = [ [[-1,0],[1,0],[1,1]], [[1,-1],[0,-1],[0,1]], [[-1,-1],[-1,0],[1,0]], [[0,-1],[0,1],[-1,1]]];


class Board
{
	constructor(width = 12, height = 20, pad = 1)
	{
		// width and height refer to the size of the _playing area_
		this.width = width;
		this.height = height;
		this.pad = pad;
		this.data = []

		for(var i = 0; i < width + 2 * pad; i++)
		{
			this.data[i] = []
			for(var j = 0; j < height + 2 * pad; j++)
			{
				this.data[i][j] = pieceTypes.Air;
			}
		}
		for(var i = 0; i < width + 2 * pad; i++)
		{
			for(var j = 0; j < pad; j++)
			{
				this.data[i][j] = pieceTypes.Brick;
				this.data[i][this.height + 2 * pad - j - 1] = pieceTypes.Brick;
			}
		}
		for(var j = 0; j < height + 2 * pad; j++)
		{
			for(var i = 0; i < pad; i++)
			{
				this.data[i][j] = pieceTypes.Brick;
				this.data[this.width + 2 * pad - i - 1][j] = pieceTypes.Brick;
			}
		}
	}

	valid(blocks)
	{
		for(var i = 0; i < blocks.length; i++)
		{
			var x = blocks[i][0];
			var y = blocks[i][1];
			if(x < this.pad || x >= this.width + this.pad || y < this.pad || y >= this.height + this.pad)
				return false
			if(this.data[x][y] !== pieceTypes.Air)
				return false
		}
		return true
	}

	// print()
	// {
	// 	for (var i = 0; i < this.width + 2 * this.pad; i++)
	// 	{
	// 		for (var j = 0; j < this.height + 2 * this.pad; j++)
	// 		{
	// 			drawBlock(this.data[i][j], i, j, size);
	// 		}
	// 	}
	// }

	print()
	{
		for (var i = this.pad; i < this.width + this.pad; i++)
		{
			for (var j = this.pad; j < this.height + this.pad; j++)
			{
				drawBlock(this.data[i][j], i, j, size);
			}
		}
	}

	border()
	{
		for (var i = 0; i < this.width + 2 * this.pad; i++)
		{
			for (var j = 0; j < this.pad; j++)
			{
				drawBlock(this.data[i][j], i, j, size);
			}

			for (var j = this.height - this.pad; j < this.height + 2 * this.pad; j++)
			{
				drawBlock(this.data[i][j], i, j, size);
			}
		}

		for (var j = this.pad; j < this.height + this.pad; j++)
		{
			for (var i = 0; i < this.pad; i++)
			{
				drawBlock(this.data[i][j], i, j, size);
			}

			for (var i = this.width - this.pad; i < this.width + 2 * this.pad; i++)
			{
				drawBlock(this.data[i][j], i, j, size);
			}
		}
	}

	clear()
	{
		var working = true;
		while(working)
		{
			working = false;
			for (var j = this.pad; j < this.height + this.pad; j++)
			{
				var filled = true;
				for (var i = this.pad; i < this.width + this.pad; i++)
				{
					if(this.data[i][j] == pieceTypes.Air)
					{
						filled = false;
					}
				}

				if(filled)
				{
					working = true;
					for(var k = j; k >= this.pad; k--)
					{
						for (var i = this.pad; i < this.width + this.pad; i++)
						{
							if(k > this.pad)
							{
								this.data[i][k] = this.data[i][k-1];
							}
							else
							{
								this.data[i][k] = pieceTypes.Air;
							}
						}
					}
				}
			}
		}
	}

	clone()
	{
		var newBoard = new Board(this.width, this.height, this.pad);
		for (var i = 0; i < this.width + 2 * this.pad; i++)
		{
			for (var j = 0; j < this.height + 2 * this.pad; j++)
			{
				newBoard.data[i][j] = this.data[i][j];
			}
		}

		return newBoard;
	}

	fitness()
	{
		var irregularity = 0;
		var caves = 0;
		var caveTop = this.height;
		var wells = 0;
		var avg = 0;
		var peak = 0;

		var tops = []
		for (var i = this.pad; i < this.width + this.pad; i++)
		{
			var searching = true;
			var j = this.pad;
			while(searching)
			{
				if(this.data[i][j] !== pieceTypes.Air)
				{
					searching = false;
					tops.push(this.pad + this.height - j);
					j--;
				}
				j++;
			}
		}

		for (var i = 0; i < tops.length; i++)
		{
			avg += tops[i] / this.width;
			peak = Math.max(peak, tops[i])
		}

		for (var i = 0; i < tops.length - 1; i++)
			irregularity += Math.pow(tops[i+1] - tops[i], 2);
		irregularity = Math.sqrt(irregularity);

		for (var i = 0; i < tops.length - 2; i++)
			if(tops[i] - tops[i+1] >= 2 && tops[i+2] - tops[i+1] >= 2)
				wells += Math.pow(tops[i+1] - tops[i], 2) + Math.pow(tops[i+2] - tops[i+1], 2);

		if(tops[1] - tops[0] >= 2)
			wells += Math.pow((tops[1] - tops[0]), 4);
		if(tops[-2] - tops[-1] >= 2)
			wells += Math.pow((tops[-2] - tops[-1]), 4);
		wells = Math.sqrt(wells);

		for (var i = this.pad; i < this.width + this.pad; i++)
		{
			var filled = 0;
			for (var j = 0; j < tops[i - this.pad]; j++)
			{
				if(this.data[i][this.height + this.pad - j] !== pieceTypes.Air)
				{
					filled++;
				}
				else
				{
					caveTop = max(caveTop, tops[i - this.pad]);
				}
			}
			caves += (tops[i - this.pad] - filled) ;
		}

		// return height + irregularity + tunnels + 100 * caves + 100 * peak;
		return 100 * caves +  irregularity + 10 * wells + 0 * peak;
	}
}

class Piece
{
	// static states = { falling : 0, resting : 1, locked : 2, printed : 3}

	constructor(type, orientation)
	{
		this.type = type;
		this.orientation = orientation;
		this.orientations = pieceShapes[this.type].length
		// this.state = states.falling;
		this.made = false;
	}

	attach(board)
	{
		this.board = board;
		this.x = 4 + this.board.pad;
		this.y = this.board.pad;
		this.shadowX = this.x;
		this.shadowY = this.y;
	}

	advance()
	{
		this.y++;
		if(this.collision())
		{
			this.y--;
			this.made = true;
		}
	}

	rotate()
	{
		this.orientation++;
		this.orientation %= pieceShapes[this.type].length;
		if(this.collision())
		{
			this.orientation--;
			this.orientation += pieceShapes[this.type].length;
			this.orientation %= pieceShapes[this.type].length;
		}
	}

	left()
	{
		if(!this.made)
		{	
			this.x--;
			if(this.collision())
				this.x++;
		}	
	}

	right()
	{
		if(!this.made)
		{
			this.x++;
			if(this.collision())
				this.x--;
		}
	}

	hard()
	{
		this.y = this.shadowY;
		this.made = true;
	}

	collision(document = false)
	{
		var offsets = (pieceShapes[this.type])[this.orientation];	
		var positions = [
			[this.x, this.y],
			[this.x + offsets[0][0], this.y + offsets[0][1]],
			[this.x + offsets[1][0], this.y + offsets[1][1]],
			[this.x + offsets[2][0], this.y + offsets[2][1]]
			]
		var result = !this.board.valid(positions);
		return result;
	}

	shadow()
	{
		var offsets = (pieceShapes[this.type])[this.orientation];

		this.shadowX = this.x;
		this.shadowY = this.y;
		var searching = true;
		while(searching)
		{
			this.shadowY++;
			var positions = [
				[this.shadowX, this.shadowY],
				[this.shadowX + offsets[0][0], this.shadowY + offsets[0][1]],
				[this.shadowX + offsets[1][0], this.shadowY + offsets[1][1]],
				[this.shadowX + offsets[2][0], this.shadowY + offsets[2][1]]
			];
			searching = this.board.valid(positions);
		}
		this.shadowY--;
	}

	make()
	{
		var offsets = (pieceShapes[this.type])[this.orientation];
		this.shadow();
		drawBlock(pieceTypes.Shadow, this.shadowX, this.shadowY, size);
		drawBlock(pieceTypes.Shadow, this.shadowX + offsets[0][0], this.shadowY + offsets[0][1], size);
		drawBlock(pieceTypes.Shadow, this.shadowX + offsets[1][0], this.shadowY + offsets[1][1], size);
		drawBlock(pieceTypes.Shadow, this.shadowX + offsets[2][0], this.shadowY + offsets[2][1], size);

		drawBlock(this.type, this.x, this.y, size);
		drawBlock(this.type, this.x + offsets[0][0], this.y + offsets[0][1], size);
		drawBlock(this.type, this.x + offsets[1][0], this.y + offsets[1][1], size);
		drawBlock(this.type, this.x + offsets[2][0], this.y + offsets[2][1], size);
	}

	print()
	{
		var offsets = (pieceShapes[this.type])[this.orientation];
		this.board.data[this.x][this.y] = this.type;
		this.board.data[this.x + offsets[0][0]][this.y + offsets[0][1]] = this.type;
		this.board.data[this.x + offsets[1][0]][this.y + offsets[1][1]] = this.type;
		this.board.data[this.x + offsets[2][0]][this.y + offsets[2][1]] = this.type;
	}

	optimal()
	{
		var bestPiece = new Piece(this.type, this.orientation)
		var fitness = -1;
		for (var orientation = 0; orientation < pieceShapes[this.type].length; orientation++)
		{
			for (var x = this.board.pad; x < this.board.width + this.board.pad; x++)
			{
				var testBoard = this.board.clone();
				var testPiece = new Piece(this.type, orientation);
				testPiece.attach(testBoard);
				testPiece.y++;
				testPiece.x = x;
				if(!testPiece.collision())
				{
					testPiece.shadow();
					testPiece.hard();
					testPiece.print();
					testBoard.clear();

					var testFitness = testBoard.fitness();
					if(fitness < 0 || testFitness < fitness)
					{
						bestPiece.orientation = orientation;
						bestPiece.x = testPiece.x;
						bestPiece.y = this.board.pad;
						fitness = testFitness;
					}
				}
			}
		}

		return bestPiece;
	}
}

class Press
{
	static type = { up : 0, down : 1, hold : 2 };
	constructor(func, stick = 20, repeat = 2)
	{
		this.press = false;
		this.state = Press.type.up;
		this.stick = stick;
		this.repeat = repeat;
		this.held = 0;
		this.repeater = 0;
		this.func = func;
	}

	update()
	{
		if(this.press)
		{
			if(this.state === Press.type.up)
			{
				this.state = Press.type.down;
				this.held = 0;
				this.repeater = 0;
			}
			else if(this.state === Press.type.down)
			{
				this.held++;
			}

			if(this.held >= this.stick)
			{
				this.held = this.stick
				this.repeater++;
				this.repeater %= this.repeat;
				this.state = Press.type.held;
			}
		}
		else
		{
			this.state = Press.type.up;
			this.held = 0;
		}

		if(this.state === Press.type.down && this.held == 0 || this.state === Press.type.held && this.repeater == 0)
		{
			this.func();
		}
	}
}


piece = new Piece(pieceTypes.O, 0);
board = new Board();
piece.attach(board);

Up = new Press(() => piece.rotate());
Down = new Press(() => piece.advance());
Left = new Press(() => piece.left());
Right = new Press(() => piece.right());


function drawBlock(type, x, y, size)
{
	x *= size;
	y *= size;
	var r = 0;
	var g = 0;
	var b = 0;
	
	switch(type)
	{
		case pieceTypes.O: r = 255; g = 222; b = 2; break;
		case pieceTypes.I: r = 1; g = 255; b = 255; break;
		case pieceTypes.S: r = 255; g = 0; b = 0; break;
		case pieceTypes.Z: r = 0; g = 255; b = 33; break;
		case pieceTypes.T: r = 181; g = 0; b = 255; break;
		case pieceTypes.L: r = 0; g = 32; b = 255; break;
		case pieceTypes.J: r = 255; g = 107; b = 0; break;
		case pieceTypes.Shadow: r = 132; g = 132; b = 132; break;
		case pieceTypes.Air: r = 0; g = 0; b = 0;
		case pieceTypes.Brick: r = 64; g = 64; b = 64;
	}

	strokeWeight(0)
	if(type === pieceTypes.Air)
	{
		offset = (x / size + y / size) % 2 * 24
		fill(64 + offset, 64 + offset, 64 + offset);
		rect(x, y, size, size);
	}
	else
	{
		fill(r, g, b);
		rect(x, y, size, size);
		fill(r / 2, g / 2, b / 2);
		rect(x + size / 4, y + size / 4, size / 2, size / 2);
		fill((r + 255) / 2, (g + 255) / 2, (b + 255) / 2);
		rect(x, y, size * 3 / 4, size / 4);
		rect(x, y, size / 4, size);	
	}
}


var now = 0;
var lastAdvance = 0;
var lastDraw = 0;
var count = 0;

// 
// ––––––––––––––––––––––––––––––––––– p5 callbacks
// 

function setup()
{
	createCanvas(size * (board.width + 2 * board.pad),size * (board.height + 2 * board.pad));
	frameRate(120);
}

function frame()
{
	Up.update();
	Down.update();
	Left.update();
	Right.update();
	board.print();
	piece.make();
	board.border();
}

function advance()
{
	piece.advance();
}

function draw()
{
	now = Date.now();

	// if(now - lastDraw > 32)
	// {
	// 	frame();
	// }


	if(piece.made)
	{
		piece.print()
		piece = new Piece(int(7 * random()), 0);
		piece.attach(board);
		piece = piece.optimal();
		piece.board = board;
		board.clear();
		Up.press = false;
		Down.press = false;
		Left.press = false;
		Right.press = false;
	}

	if(now - lastAdvance > 16)
	{
		frame();
		piece.hard();
		count++;
		lastAdvance = now;
	}
}

function keyPressed()
{
	if (keyCode === UP_ARROW) Up.press = true;
	if (keyCode === DOWN_ARROW) Down.press = true;
	if (keyCode === RIGHT_ARROW) Right.press = true;
	if (keyCode === LEFT_ARROW) Left.press = true;
	if (key === ' ') piece.hard()
}

function keyReleased()
{
	if (keyCode === UP_ARROW) Up.press = false;
	if (keyCode === DOWN_ARROW) Down.press = false;
	if (keyCode === RIGHT_ARROW) Right.press = false;
	if (keyCode === LEFT_ARROW) Left.press = false;
}