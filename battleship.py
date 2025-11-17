import random
import os

class BattleshipGame:
    def __init__(self):
        self.board_size = 10
        self.ships = {
            'Carrier': 5,
            'Battleship': 4,
            'Cruiser': 3,
            'Submarine': 3,
            'Destroyer': 2
        }
        self.player_board = self.create_board()
        self.computer_board = self.create_board()
        self.computer_guesses = set()
        self.place_ships(self.player_board, "Player")
        self.place_ships(self.computer_board, "Computer")

    def create_board(self):
        return [["~"] * self.board_size for _ in range(self.board_size)]

    def print_board(self, board, show_ships=False):
        print("   " + " ".join(str(i) for i in range(self.board_size)))
        for i in range(self.board_size):
            row = []
            for j in range(self.board_size):
                if board[i][j] == "S" and not show_ships:
                    row.append("~")
                else:
                    row.append(board[i][j])
            print(f"{i}  {" ".join(row)}")

    def is_valid_placement(self, board, row, col, size, direction):
        if direction == 'H':
            if col + size > self.board_size:
                return False
            return all(cell != "S" for cell in board[row][col:col+size])
        else:  # Vertical
            if row + size > self.board_size:
                return False
            return all(board[r][col] != "S" for r in range(row, row+size))

    def place_ships(self, board, player):
        for ship, size in self.ships.items():
            placed = False
            attempts = 0
            while not placed and attempts < 100:
                row = random.randint(0, self.board_size - 1)
                col = random.randint(0, self.board_size - 1)
                direction = random.choice(['H', 'V'])
                
                if self.is_valid_placement(board, row, col, size, direction):
                    if direction == 'H':
                        for i in range(size):
                            board[row][col + i] = "S"
                    else:
                        for i in range(size):
                            board[row + i][col] = "S"
                    placed = True
                attempts += 1
            if not placed:
                print(f"Failed to place {ship} after 100 attempts. Restarting ship placement...")
                return self.place_ships(board, player)

    def player_turn(self):
        while True:
            try:
                print("\nYour turn!")
                print("Computer's board:")
                self.print_board(self.computer_board)
                
                guess = input("Enter your guess (row col): ").split()
                if len(guess) != 2:
                    print("Please enter row and column numbers.")
                    continue
                    
                row, col = map(int, guess)
                
                if not (0 <= row < self.board_size and 0 <= col < self.board_size):
                    print("Guess is out of bounds. Try again.")
                    continue
                    
                if self.computer_board[row][col] in ["X", "O"]:
                    print("You've already guessed that location!")
                    continue
                    
                if self.computer_board[row][col] == "S":
                    print("Hit!")
                    self.computer_board[row][col] = "X"
                else:
                    print("Miss!")
                    self.computer_board[row][col] = "O"
                break
                
            except ValueError:
                print("Please enter valid numbers.")

    def computer_turn(self):
        print("\nComputer's turn!")
        while True:
            row = random.randint(0, self.board_size - 1)
            col = random.randint(0, self.board_size - 1)
            if (row, col) not in self.computer_guesses:
                self.computer_guesses.add((row, col))
                if self.player_board[row][col] == "S":
                    print(f"Computer hit at ({row}, {col})!")
                    self.player_board[row][col] = "X"
                else:
                    print(f"Computer missed at ({row}, {col}).")
                    self.player_board[row][col] = "O"
                break

    def check_win(self, board):
        return all(cell != "S" for row in board for cell in row)

    def play(self):
        print("Welcome to Battleship!")
        print("Sink all of your opponent's ships to win!")
        
        while True:
            # Player's turn
            self.player_turn()
            if self.check_win(self.computer_board):
                print("\nCongratulations! You sunk all the computer's ships!")
                print("Your final board:")
                self.print_board(self.player_board, show_ships=True)
                print("\nComputer's final board:")
                self.print_board(self.computer_board, show_ships=True)
                break
                
            # Computer's turn
            self.computer_turn()
            print("\nYour board:")
            self.print_board(self.player_board, show_ships=True)
            
            if self.check_win(self.player_board):
                print("\nOh no! The computer sunk all your ships!")
                print("Your final board:")
                self.print_board(self.player_board, show_ships=True)
                print("\nComputer's final board:")
                self.print_board(self.computer_board, show_ships=True)
                break

if __name__ == "__main__":
    while True:
        game = BattleshipGame()
        game.play()
        if input("\nWould you like to play again? (y/n): ").lower() != 'y':
            break
