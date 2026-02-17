-- credit_system_test_cases.sql
-- Manual SQL test cases for migration 039_credit_system.sql

-- 1) Formula unit tests
select public.calculate_download_cost(0)  as cost_0_should_be_1;
select public.calculate_download_cost(1)  as cost_1_should_be_1;
select public.calculate_download_cost(5)  as cost_5_should_be_1;
select public.calculate_download_cost(6)  as cost_6_should_be_2;
select public.calculate_download_cost(99) as cost_99_should_be_20;

select public.calculate_upload_reward(1)  as reward_1_should_be_0;
select public.calculate_upload_reward(10) as reward_10_should_be_6;
select public.calculate_upload_reward(20) as reward_20_should_be_12;

-- 2) New-user profile creation (execute in auth-admin context)
-- Insert a user into auth.users and verify:
--   - profiles row exists with credits = 20
--   - credit_transactions row with kind STARTER and amount 20 exists

-- 3) Approve resource reward calculation
-- Setup:
--   - create pending resource with known page_count for test uploader
--   - set reward_override null and quality_multiplier 1.5
-- Assert:
--   - status changes to approved
--   - uploader credits increase by floor(calculate_upload_reward(cost) * 1.5)
--   - first approval adds +3 bonus once only

-- 4) Reward override precedence
-- Setup pending resource with reward_override = 9 and quality_multiplier = 2.0
-- Assert reward uses 9 (plus first-upload bonus only if applicable)

-- 5) Download charging
-- Setup approved resource with page_count = 26 (cost = 6)
-- Assert:
--   - downloader credits decrease by 6
--   - one download row inserted
--   - one DOWNLOAD transaction with amount -6

-- 6) Boost sink
-- Call create_boost(resource_id, 4, 7)
-- Assert:
--   - profile credits decrease by 4
--   - resource_boosts row exists
--   - BOOST transaction with amount -4 exists

-- 7) Bounty sink and payout
-- Call create_bounty('Need notes', 'Chapter 3', 12, now() + interval '7 days')
-- Assert create:
--   - creator credits decrease by 12
--   - BOUNTY_CREATE transaction amount -12 exists
-- Call award_bounty(bounty_id, winner_id, 'Delivered PDF')
-- Assert payout:
--   - winner credits increase by 12
--   - BOUNTY_PAYOUT transaction amount +12 exists

-- 8) RLS checks
-- Authenticated user can:
--   - select own profile and own transactions
--   - select approved resources
--   - select all bounties
-- Authenticated non-mod cannot:
--   - read another user boosts
--   - approve resources
-- Mod can:
--   - read all credit transactions
--   - approve resources
