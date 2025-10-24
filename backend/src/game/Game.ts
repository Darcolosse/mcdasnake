import { Entity } from "@/Entity";
import { Snake } from "@/Snake";
import { Apple } from "@/Apple";
import { Direction } from "@/Direction";

export class Game {
	private height: number;
	private width: number;

	private snakes: Map<string, Snake>;
	private apples: Map<string, Apple>;

	private map: Map<[number, number], Entity>;

	private tickRate: number;

	constructor(width: number = 800, height: number = 800, tickRate: number = 60) {
		this.width = width;
		this.height = height;
		this.snakes = new Map<string, Snake>();
		this.apples = new Map<string, Apple>();
		this.tickRate = tickRate;
		this.map = new Map<[number, number], Entity>();
	}

	public updateGame() {
		this.moveSnakes();
		this.checkCollisions();
		setTimeout(this.updateGame, 1000 / this.tickRate);
	}

	public getState() {
		return this.map;
	}

	public moveSnakes() {
		this.snakes.forEach(snake => {
			snake.move();
		});
	}

	private checkCollisions() {
		this.snakes.forEach(snake => {
			for (const [coord, entity] of this.map) {
				if (this.map.has(coord)) {
					if (entity instanceof Snake) {
						snake.dead = true;
					} else if (entity instanceof Apple) {
						snake.grow = true;
						this.apples.delete(entity.id);
						this.map.delete(coord);
					} else {
						this.map.set(coord, snake);
					}
				}
			}
		});
	}

	public updateDirection(snakeId: string, direction: Direction) {
		this.snakes.get(snakeId)?.setDirection(direction);
	}

	public addSnake(snakeId: string, name: string, coordinates: [[number, number]], direction: Direction) {
		this.snakes.set(snakeId, new Snake(snakeId, name, coordinates, direction));
	}

	public addApple(apple: Apple) {
		this.apples.set(apple.id, apple);
	}

	public removeSnake(id: string) {
		this.snakes.delete(id);
	}

	public removeApple(id: string) {
		this.apples.delete(id);
	}

	public static random(min: number, max: number){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	public getCoordinates(): [number, number] {
		return [this.width, this.height]
	}
}