from flask import Flask, render_template, request, jsonify
import json
import random

app = Flask(__name__)

# Store the current puzzle as a global variable
current_puzzle = None

# Function to generate a valid Sudoku board
def generate_sudoku():
    board = [[0]*9 for _ in range(9)]  # Create a new 9x9 board
    fill_sudoku(board)  # Call the function to fill the board
    return board  # Return the filled board

# Function to fill the Sudoku board
def fill_sudoku(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:  # Empty cell
                for num in range(1, 10):  # Try numbers 1-9
                    if is_safe(board, i, j, num):
                        board[i][j] = num
                        if fill_sudoku(board):  # Recursive call
                            return True
                        board[i][j] = 0  # Reset if not solved
                return False  # Trigger backtracking
    return True  # Puzzle filled

# Function to check if a number can be placed in a cell
def is_safe(board, row, col, num):
    for x in range(9):
        if board[row][x] == num or board[x][col] == num:
            return False
    startRow, startCol = 3 * (row // 3), 3 * (col // 3)
    for i in range(3):
        for j in range(3):
            if board[i + startRow][j + startCol] == num:
                return False
    return True

# Function to remove numbers based on difficulty level
def remove_numbers(board, difficulty):
    attempts = 0
    if difficulty == 'easy':
        attempts = random.randint(25, 30)
    elif difficulty == 'medium':
        attempts = random.randint(35, 40)
    elif difficulty == 'hard':
        attempts = random.randint(45, 50)
    else:  # impossible
        attempts = random.randint(55, 60)

    while attempts > 0:
        row = random.randint(0, 8)
        col = random.randint(0, 8)
        if board[row][col] != 0:
            board[row][col] = 0
            attempts -= 1

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    global current_puzzle  # Use the global variable
    difficulty = request.json['difficulty']
    current_puzzle = generate_sudoku()
    print("Generated Puzzle before removing numbers:", current_puzzle)  # Debugging line
    remove_numbers(current_puzzle, difficulty)
    print("Puzzle after removing numbers:", current_puzzle)  # Debugging line
    return jsonify({'puzzle': current_puzzle})

@app.route('/solve', methods=['POST'])
def solve():
    if current_puzzle is not None:
        solution = [row[:] for row in current_puzzle]  # Copy current puzzle
        if solve_sudoku(solution):  # Attempt to solve
            return jsonify({'solution': solution})
    return jsonify({'solution': None})  # Return None if no puzzle is generated

# Function to solve the Sudoku puzzle
def solve_sudoku(board):
    empty = find_empty_location(board)
    if not empty:  # No empty space left
        return True  # Puzzle is solved

    row, col = empty
    for num in range(1, 10):  # Try numbers 1-9
        if is_safe(board, row, col, num):
            board[row][col] = num
            if solve_sudoku(board):
                return True
            board[row][col] = 0  # Reset if not solved
    return False  # Trigger backtracking

# Function to find an empty location in the board
def find_empty_location(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:
                return (i, j)
    return None

@app.route('/check', methods=['POST'])
def check():
    data = request.json
    row = data['row']
    col = data['col']
    value = data['value']

    # Check if the player's answer is correct against the original puzzle
    if current_puzzle[row][col] == value:
        return jsonify({'correct': True})
    else:
        return jsonify({'correct': False})

if __name__ == '__main__':
    app.run(debug=True)
