<?php

use Flarum\Database\Migration;
use Flarum\Group\Group;

return Migration::addPermissions([
    'ziven.zivenAllowGuaGuaLe' => Group::MEMBER_ID
]);
