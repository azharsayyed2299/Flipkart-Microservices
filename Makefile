.PHONY: up down logs seed check clean ps

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

ps:
	docker compose ps

seed:
	docker compose exec product-service npm run seed

check:
	./scripts/check-backend-syntax.sh

clean:
	docker compose down -v --remove-orphans
