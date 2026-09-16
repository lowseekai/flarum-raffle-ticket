<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('ziven_guaguale')) {
            $schema->create('ziven_guaguale', function (Blueprint $table) {
                $table->increments('id');
                $table->string('title', 255);
                $table->string('desc', 255);
                $table->string('color', 20)->nullable();
                $table->string('image', 255)->nullable();
                $table->integer('amount')->unsigned();
                $table->integer('purchased')->default(0);
                $table->string('settings', 1000);
                $table->float('cost')->unsigned();
                $table->boolean('activated')->default(0);
                $table->dateTime('assigned_at');

                $table->index('assigned_at');
                $table->index('activated');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->drop('ziven_guaguale');
    },
];
