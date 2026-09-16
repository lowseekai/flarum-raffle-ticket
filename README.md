# Raffle Ticket

A Flarum 2 extension that lets registered users spend community points to purchase
raffle tickets and reveal their results.

## Requirements

- Flarum `2.0.0-rc.8` or a compatible Flarum 2 release
- [Point System](https://github.com/lowseekai/point-system)

## Features

- Customizable raffle ticket packs
- Multiple active raffle packs
- Ticket scratch and result history
- Point System integration for purchases and winnings

## Installation

```sh
composer require lowseekai/flarum-raffle-ticket
php flarum migrate
php flarum assets:publish
php flarum cache:clear
```

## Updating

```sh
composer update lowseekai/flarum-raffle-ticket
php flarum migrate
php flarum assets:publish
php flarum cache:clear
```

## Links

- [GitHub](https://github.com/lowseekai/flarum-raffle-ticket)
