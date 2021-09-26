class Tetris
{
	constructor(framerate)
	{
		this.framerate = framerate;
		this.now = Date.now();
		this.then = this.now;
		this.controls = [];
		this.piece = new Piece(Piece.types.O, 0);
	}


	frame()
	{
		if(this.now - this.then > 1000.0 / this.framerate)
		{

			this.then = this.now;
			this.now = Date.now();
		}
	}

	keys(press)
	{
		if(press)
			this.press();
		else
			this.release();
	}

	press()
	{
		for(var i = 0; i < this.controls.length; i++)
			controls[i].pressed();
	}

	release()
	{
		for(var i = 0; i < this.controls.length; i++)
			controls[i].released();
	}
}

class Press
{
	static type = { up : 0, down : 1, hold : 2 };
	constructor(keycode, func, stick = 20, repeat = 2)
	{
		this.keycode = keycode;
		this.press = false;
		this.state = Press.type.up;
		this.stick = stick;
		this.repeat = repeat;
		this.held = 0;
		this.repeater = 0;
		this.func = func;
	}

	pressed()
	{
		if (keyCode === this.keycode) this.press = true;
	}

	released()
	{
		if (keyCode === this.keycode) this.press = false;
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


class Piece
{
	static types = { O : 0, I : 1, S : 2, Z : 3, T : 4, L : 5, J : 6, Shadow : 7, Air : 8, Brick : 9 };
	static shapes = {};

	static states = { falling : 0, resting : 1, locked : 2, printed : 3 };
	static init = (function() 
	{
		Piece.shapes[Piece.types.O] = [ [[1,0],[0,1],[1,1]] ];
		Piece.shapes[Piece.types.I] = [ [[-1,0],[1,0],[2,0]], [[0,-1],[0,1],[0,2]] ];
		Piece.shapes[Piece.types.S] = [ [[1,0],[0,1],[-1,1]], [[0,-1],[1,0],[1,1]] ];
		Piece.shapes[Piece.types.Z] = [ [[-1,0],[0,1],[1,1]], [[1,-1],[1,0],[0,1]] ];
		Piece.shapes[Piece.types.T] = [ [[-1,0],[1,0],[0,1]], [[0,-1],[1,0],[0,1]], [[-1,0],[0,-1],[1,0]], [[0,-1],[-1,0],[0,1]] ];
		Piece.shapes[Piece.types.L] = [ [[-1,0],[1,0],[-1,1]], [[0,-1],[0,1],[1,1]], [[1,-1],[1,0],[-1,0]], [[-1,-1],[0,-1],[0,1]] ];
		Piece.shapes[Piece.types.J] = [ [[-1,0],[1,0],[1,1]], [[1,-1],[0,-1],[0,1]], [[-1,-1],[-1,0],[1,0]], [[0,-1],[0,1],[-1,1]]];

		console.log("Static Piece constructor called.")
	});

	constructor(type, orientation)
	{
		this.type = type;
		this.orientation = orientation;
		this.orientations = Piece.shapes[this.type].length
		this.state = Piece.states.falling;
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
		this.orientation %= Piece.shapes[this.type].length;
		if(this.collision())
		{
			this.orientation--;
			this.orientation += Piece.shapes[this.type].length;
			this.orientation %= Piece.shapes[this.type].length;
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
		var offsets = (Piece.shapes[this.type])[this.orientation];	
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
		var offsets = (Piece.shapes[this.type])[this.orientation];

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
		var offsets = (Piece.shapes[this.type])[this.orientation];
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
		var offsets = (Piece.shapes[this.type])[this.orientation];
		this.board.data[this.x][this.y] = this.type;
		this.board.data[this.x + offsets[0][0]][this.y + offsets[0][1]] = this.type;
		this.board.data[this.x + offsets[1][0]][this.y + offsets[1][1]] = this.type;
		this.board.data[this.x + offsets[2][0]][this.y + offsets[2][1]] = this.type;
	}

	optimal()
	{
		var bestPiece = new Piece(this.type, this.orientation)
		var fitness = -1;
		for (var orientation = 0; orientation < Piece.shapes[this.type].length; orientation++)
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

var tetris = new Tetris(60);




// function draw()
// {
// 	tetris.frame();
// }


// function keyPressed()
// {
// 	tetris.keys(true);
// }

// function keyReleased()
// {
// 	tetris.keys(false);
// }