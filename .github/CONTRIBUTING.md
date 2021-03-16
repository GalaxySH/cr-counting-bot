# Contributing

If you wish to contribute to the cr-counting codebase, feel free to fork the repository and submit a pull request.

## Development Setup

1. Clone the `#master` branch of this repo

2. Create a `.env` file using the [template](https://github.com/GalaxySH/cr-counting-bot/tree/main/.env-example)

3. Run

   ```bash
   docker-compose up -f docker-compose.dev.yml --build -t counting_human -d
   docker logs crBotDev -f --tail 1000
   ```

4. Happy Coding!

   This setup includes live reloading. All you need to do is edit the code and save to see the changes reflected in the bot.

5. When you finish your changes, run

   ```bash
   docker-compose -f "docker-compose.yml" up -d --build -t counting_human
   ```

   to make sure your changes work in prod

6. Send a [pull request](https://github.com/GalaxySH/cr-counting-bot/compare) with your changes
