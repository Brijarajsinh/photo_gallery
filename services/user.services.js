const functionUsage = require('../helpers/function');

//referralBonus function provides service to add referral bonus to referred user
exports.referralBonus = async (user) => {
    await functionUsage.applyReferBonus(user);
}