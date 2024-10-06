$(document).ready(function() {
    const sudokuGrid = $('#sudoku-grid');

    // Function to create the Sudoku grid from a puzzle
    function createGrid(puzzle) {
        sudokuGrid.empty();  // Clear the grid before creating a new one
        puzzle.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                const cell = $('<input>', {
                    type: 'number',
                    min: '1',
                    max: '9',
                    class: 'cell',
                    value: value !== 0 ? value : '', // Display number if not 0
                    readonly: value !== 0 // Make non-empty cells read-only
                });

                // Add an event listener to check input on change
                cell.on('change', function() {
                    const inputValue = parseInt(this.value);
                    if (this.value) {
                        $.ajax({
                            type: 'POST',
                            url: '/check',
                            contentType: 'application/json',
                            data: JSON.stringify({ row: rowIndex, col: colIndex, value: inputValue }),
                            success: function(response) {
                                if (response.correct) {
                                    alert('Correct!');
                                    $(cell).css('background-color', 'lightgreen');
                                } else {
                                    alert('Incorrect!');
                                    $(cell).css('background-color', 'lightcoral');
                                }
                            }
                        });
                    }
                });

                sudokuGrid.append(cell);
            });
        });
    }

    $('#generate-btn').click(() => {
        const difficulty = $('#difficulty').val();
        $.ajax({
            type: 'POST',
            url: '/generate',
            contentType: 'application/json',
            data: JSON.stringify({ difficulty: difficulty }),
            success: function(response) {
                createGrid(response.puzzle);  // Create grid with the new puzzle
            },
            error: function(xhr, status, error) {
                console.error('Error generating Sudoku:', error); // Log any errors
            }
        });
    });

    $('#solve-btn').click(() => {
        const board = [];
        $('#sudoku-grid .cell').each(function(index) {
            const row = Math.floor(index / 9);
            const col = index % 9;
            board[row] = board[row] || [];
            board[row][col] = this.value ? parseInt(this.value) : 0; // Handle empty cells
        });

        $.ajax({
            type: 'POST',
            url: '/solve',
            contentType: 'application/json',
            data: JSON.stringify({ board: board }),
            success: function(response) {
                if (response.solution) {
                    response.solution.forEach((row, rowIndex) => {
                        row.forEach((value, colIndex) => {
                            const cell = $('#sudoku-grid .cell').eq(rowIndex * 9 + colIndex);
                            cell.val(value);
                        });
                    });
                } else {
                    alert('No solution found!');
                }
            }
        });
    });

    // Reset the Sudoku grid
    $('#reset-btn').click(() => {
        sudokuGrid.empty();
    });
});


// Function to create the Sudoku grid from a puzzle
function createGrid(puzzle) {
    sudokuGrid.empty();  // Clear the grid before creating a new one
    puzzle.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            const cell = $('<input>', {
                type: 'number',
                min: '1',
                max: '9',
                class: 'cell',
                value: value !== 0 ? value : '', // Display number if not 0
                readonly: value !== 0 // Make non-empty cells read-only
            });

            // Add an event listener to check input on change
            cell.on('change', function() {
                const inputValue = parseInt(this.value);
                if (this.value) {
                    $.ajax({
                        type: 'POST',
                        url: '/check',
                        contentType: 'application/json',
                        data: JSON.stringify({ row: rowIndex, col: colIndex, value: inputValue }),
                        success: function(response) {
                            if (response.correct) {
                                $(cell).css('background-color', 'lightgreen');
                                // After each valid input, check if the puzzle is solved
                                if (isSudokuSolved()) {
                                    showCongratulations(); // Call the congratulations function
                                }
                            } else {
                                $(cell).css('background-color', 'lightcoral');
                            }
                        }
                    });
                }
            });

            sudokuGrid.append(cell);
        });
    });
}

// Function to check if the Sudoku puzzle is solved
function isSudokuSolved() {
    let solved = true;
    $('#sudoku-grid .cell').each(function(index) {
        const value = $(this).val();
        if (!value || value === '0') {
            solved = false; // If any cell is empty, it's not solved
        }
    });
    return solved;
}

// Function to show congratulations message
function showCongratulations() {
    alert('Congratulations! You have successfully completed the Sudoku puzzle! 🎉');
}

// Event handler for the 'Generate' button
$('#generate-btn').click(() => {
    const difficulty = $('#difficulty').val();
    $.ajax({
        type: 'POST',
        url: '/generate',
        contentType: 'application/json',
        data: JSON.stringify({ difficulty: difficulty }),
        success: function(response) {
            createGrid(response.puzzle);  // Create grid with the new puzzle
        },
        error: function(xhr, status, error) {
            console.error('Error generating Sudoku:', error); // Log any errors
        }
    });
});
