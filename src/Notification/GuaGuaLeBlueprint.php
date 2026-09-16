<?php

namespace Ziven\GuaGuaLe\Notification;

use Flarum\Database\AbstractModel;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\User\User;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;

class GuaGuaLeBlueprint implements BlueprintInterface
{
    public GuaGuaLePurchase $guagualePurchase;

    public function __construct(GuaGuaLePurchase $guagualePurchase)
    {
        $this->guagualePurchase = $guagualePurchase;
    }

    public function getSubject(): ?AbstractModel
    {
        return $this->guagualePurchase;
    }

    public function getFromUser(): ?User
    {
        return $this->guagualePurchase->purchasedUser;
    }

    public function getData(): mixed
    {
        return null;
    }

    public static function getType(): string
    {
        return 'guagualePurchase';
    }

    public static function getSubjectModel(): string
    {
        return GuaGuaLePurchase::class;
    }
}
