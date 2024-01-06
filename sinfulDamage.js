const readline = require('readline');

async function promptUserInput(question, defaultValue, parser = parseInt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, (input) => {
            rl.close();
            resolve(input ? parser(input, 10) : defaultValue);
        });
    });
}

function calculateAverageDamage(userWeaponDamage, critChance, critDamage, numAttacks = 10) {
    const avgDamagePerHit = (userWeaponDamage * (1 - critChance)) + (userWeaponDamage * critDamage * critChance);
    return avgDamagePerHit * numAttacks;
}

function findOptimalEnhancements(userWeaponDamage, baseCritChance, baseCritDamage, maxCritDamage, maxLines, maxweaponDamageLines) {
    let maxTotalDamage = 0;
    let bestDistribution = null;

    // const maxweaponDamageLines = 3; // Maximum points for weapon damage

    for (let critChanceLines = 0; critChanceLines <= maxLines; critChanceLines++) {
        for (let critDamageLines = 0; critDamageLines <= maxLines - critChanceLines; critDamageLines++) {
            for (let weaponDamageLines = 0; weaponDamageLines <= maxweaponDamageLines; weaponDamageLines++) {
                if (critChanceLines + critDamageLines + weaponDamageLines <= maxLines) {
                    let currentCritChance = baseCritChance + critChanceLines * 0.03;
                    let currentCritDamage = baseCritDamage + critDamageLines * 0.06;
                    let currentWeaponDamage = userWeaponDamage + weaponDamageLines * 129;
                    
                    if (currentCritDamage > maxCritDamage) {
                        currentCritDamage = maxCritDamage;
                    }

                    const totalDamage = calculateAverageDamage(currentWeaponDamage, currentCritChance, currentCritDamage);

                    if (totalDamage > maxTotalDamage) {
                        maxTotalDamage = totalDamage;
                        bestDistribution = { critChanceLines, critDamageLines, weaponDamageLines };
                    }
                }
            }
        }
    }

    return { bestDistribution, maxTotalDamage };
}

async function main() {
    const userWeaponDamage = await promptUserInput('Enter your Weapon Damage (default 5000): ', 5000);
    const maxLines = await promptUserInput('Enter the maximum number of lines to distribute (default 12): ', 12);
    const maxWeaponDamageEnchants = await promptUserInput(`Enter the maximum number of Weapon Damage Lines @129 Wep/Spl Dmg (default 2, max ${maxLines}): `, 2, input => Math.min(parseInt(input, 10), maxLines));

    const baseCritChance = 0.10; // 10%
    const baseCritDamage = 1.80; // +80%
    const maxCritDamage = 2.25; // +125%

    const optimalDistribution = findOptimalEnhancements(userWeaponDamage, baseCritChance, baseCritDamage, maxCritDamage, maxLines, maxWeaponDamageEnchants);
    console.log('Crit chance calculated at 3% per line (657), crit damage calculated at 6% per line, weapon damage calculated at 129 per line');
    console.log('Using: ', { baseCritChance, baseCritDamage });
    console.log('Optimal Line Distribution:', optimalDistribution.bestDistribution);
    console.log('Max Total Damage over 10 seconds:', optimalDistribution.maxTotalDamage);
}

main();