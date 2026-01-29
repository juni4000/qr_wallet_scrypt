
import { ByteString, FixedArray, int2ByteString, toByteString } from 'scrypt-ts';
import { ActionType, Item, ItemId, ValueChanges } from './Tamagochi_v1';

export const items: Item[] = [
    {
        id: ItemId.REFRIGERATOR,
        name: toByteString('Refrigerator', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 50n,
        possibleLocations: int2ByteString(3n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(10n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_REFRIGERATOR_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.CAR,
        name: toByteString('Car', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 300n,
        possibleLocations: int2ByteString(5n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(26n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_CAR_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.HOUSE,
        name: toByteString('House', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 300n,
        possibleLocations: int2ByteString(3n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(65n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_HOUSE_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.BALANCED_MEAL,
        name: toByteString('Food package', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 150n,
        possibleLocations: int2ByteString(9n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.foodSupply), 1n) + int2ByteString(11n, 2n)
    },
    {
        id: ItemId.FAST_FOOD,
        name: toByteString('Fast Food', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 21n,
        possibleLocations: int2ByteString(9n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(20n, 2n) +
            int2ByteString(BigInt(ValueChanges.foodSupply), 1n) + int2ByteString(1n, 2n)
    },
    {
        id: ItemId.BOOK,
        name: toByteString('Book', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 2n,
        possibleLocations: int2ByteString(10n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(15n, 2n)
    },
    {
        id: ItemId.SNEAKERS,
        name: toByteString('Sneakers', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 35n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_SNEAKERS_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.BACKPACK,
        name: toByteString('Backpack', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 17n,
        possibleLocations: int2ByteString(9n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.flag_HAS_BACKPACK_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.USB_MINER,
        name: toByteString('USB MINER', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 60n,
        possibleLocations: int2ByteString(10n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(75n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_has_dietwise_flag), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.MUSICAL_INSTRUMENT,
        name: toByteString('Musical Instrument', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 15n,
        possibleLocations: int2ByteString(10n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(20n, 2n)
    },
    {
        id: ItemId.BICYCLE,
        name: toByteString('Bicycle', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 30n,
        possibleLocations: int2ByteString(10n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_BICYCLE_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.EDUCATIONAL_COURSE,
        name: toByteString('Educational Course', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 155n,
        possibleLocations: int2ByteString(8n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(30n, 2n) +
            int2ByteString(BigInt(ValueChanges.educationalCourseCnt), 1n) + int2ByteString(1n, 2n)
    },
    {
        id: ItemId.MAGIC_CARD,
        name: toByteString('Magic Card', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 20n,
        possibleLocations: int2ByteString(2n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_USE_MAGIC_CARD), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.RENT,
        name: toByteString('Rent', true),
        actionType: ActionType.PAY_RENT,
        priceDaySalary: 8n,
        possibleLocations: int2ByteString(11n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.exp1), 1n) + int2ByteString(5n, 2n)
    },
    {
        id: ItemId.TRAVEL_CARD,
        name: toByteString('Travel Card', true),
        actionType: ActionType.PAY_RENT,
        priceDaySalary: 5n,
        possibleLocations: int2ByteString(2n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.exp2), 1n) + int2ByteString(5n, 2n)
    },
    {
        id: ItemId.NutriCore,
        name: toByteString('Miner Activation', true),
        actionType: ActionType.PAY_RENT,
        priceDaySalary: 15n,
        possibleLocations: int2ByteString(5n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.exp4), 1n) + int2ByteString(5n, 2n)
    },
    {
        id: ItemId.PROPERTY_INSURANCE,
        name: toByteString('Property Insurance', true),
        actionType: ActionType.PAY_RENT,
        priceDaySalary: 3n,
        possibleLocations: int2ByteString(2n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.exp3), 1n) + int2ByteString(5n, 2n)
    },
    {
        id: ItemId.WORK,
        name: toByteString('Work', true),
        actionType: ActionType.WORK,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(0n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(15n, 2n) // -1 in 2-byte signed int
    },
    {
        id: ItemId.REST,
        name: toByteString('Rest', true),
        actionType: ActionType.REST,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(4n, 1n) + int2ByteString(7n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(20n, 2n)
    },
    {
        id: ItemId.STUDY,
        name: toByteString('Study', true),
        actionType: ActionType.STUDY,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(8n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(15n, 2n)
    },
    {
        id: ItemId.INVEST,
        name: toByteString('Invest', true),
        actionType: ActionType.INVEST,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(0n, 1n),
        valuesToChange: toByteString('', true) // No direct state changes
    },
    {
        id: ItemId.WITHDRAW,
        name: toByteString('Withdraw', true),
        actionType: ActionType.WITHDRAW,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(0n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n)
    },
    {
        id: ItemId.SODA_WATER,
        name: toByteString('Soda Water', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 2n,
        possibleLocations: int2ByteString(11n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n)
    },
    {
        id: ItemId.FIND_JOB,
        name: toByteString('Find Job', true),
        actionType: ActionType.FIND_JOB,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(6n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(10n, 2n)
    },
    {
        id: ItemId.QUIT_JOB,
        name: toByteString('Quit Job', true),
        actionType: ActionType.QUIT_JOB,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(6n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(10n, 2n)
    },
    {
        id: ItemId.BANK_WORKER_CLOTHES,
        name: toByteString('Bank Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 160n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_BANK_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.FACTORY_WORKER_CLOTHES,
        name: toByteString('Factory Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 90n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_FACTORY_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.HEADHUNTER_WORKER_CLOTHES,
        name: toByteString('Headhunter Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 80n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_HEADHUNTER_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.INSURANCE_BROKER_CLOTHES,
        name: toByteString('Insurance Broker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 7n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_INSURANCE_BROKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.HITECH_WORKER_CLOTHES,
        name: toByteString('Hi-Tech Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 64n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_HITECH_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.CLOTHES_SHOP_WORKER_CLOTHES,
        name: toByteString('Clothes Shop Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 60n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_CLOTHES_SHOP_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.FOOD_WORKER_CLOTHES,
        name: toByteString('Food Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 50n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_FOOD_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.CHINATOWN_WORKER_CLOTHES,
        name: toByteString('Chinatown Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 20n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_CHINATOWN_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.RENT_WORKER_CLOTHES,
        name: toByteString('Rent Office Worker Clothes', true),
        actionType: ActionType.BUY_ITEM,
        priceDaySalary: 82n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: int2ByteString(BigInt(ValueChanges.happiness), 1n) + int2ByteString(5n, 2n) +
            int2ByteString(BigInt(ValueChanges.flag_HAS_RENT_WORKER_CLOTHES_FLAG), 1n) + int2ByteString(1n, 1n)
    },
    {
        id: ItemId.CHANGE_CLOTHES,
        name: toByteString('Change Clothes', true),
        actionType: ActionType.CHANGE_CLOTHES,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(1n, 1n),
        valuesToChange: toByteString('', true) // No direct state changes
    },
    {
        id: ItemId.MOVE_ACTION,
        name: toByteString('Move', true),
        actionType: ActionType.MOVE,
        priceDaySalary: 0n,
        possibleLocations: toByteString('', true), // No restriction logic in item, handled in processAction
        valuesToChange: toByteString('', true) // No state change via values
    },
    {
        id: ItemId.EAT_ACTION,
        name: toByteString('Eat', true),
        actionType: ActionType.EAT,
        priceDaySalary: 0n,
        possibleLocations: int2ByteString(4n, 1n) + int2ByteString(7n, 1n),
        valuesToChange: toByteString('', true)
    }
];
