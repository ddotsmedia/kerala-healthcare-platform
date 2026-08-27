import { sql } from '@khp/db';

export async function awardPoints(userId, activity) {
  const result = await sql`
    SELECT points FROM activity_points WHERE activity = ${activity}
  `;

  if (!result.length) return;

  const pts = result[0].points;

  await sql`
    INSERT INTO user_gamification (user_id, points, updated_at)
    VALUES (${userId}, ${pts}, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET points = user_gamification.points + ${pts}, updated_at = NOW()
  `;

  const user = await sql`
    SELECT points, level FROM user_gamification WHERE user_id = ${userId}
  `;

  if (user.length === 0) return;

  const newLevel = Math.floor(user[0].points / 1000) + 1;

  if (newLevel > user[0].level) {
    await sql`
      UPDATE user_gamification SET level = ${newLevel} WHERE user_id = ${userId}
    `;
    await awardBadge(userId, `Level ${newLevel}`);
  }

  await updateStreak(userId);
}

export async function updateStreak(userId) {
  const user = await sql`
    SELECT updated_at, current_streak, max_streak
    FROM user_gamification
    WHERE user_id = ${userId}
  `;

  if (!user.length) return;

  const lastUpdate = new Date(user[0].updated_at);
  const today = new Date();
  const diffDays = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    await sql`
      UPDATE user_gamification
      SET current_streak = current_streak + 1,
          max_streak = GREATEST(max_streak, current_streak + 1)
      WHERE user_id = ${userId}
    `;
  } else if (diffDays > 1) {
    await sql`
      UPDATE user_gamification SET current_streak = 0 WHERE user_id = ${userId}
    `;
  }
}

export async function awardBadge(userId, badgeName) {
  await sql`
    INSERT INTO user_badges (user_id, badge_name)
    VALUES (${userId}, ${badgeName})
    ON CONFLICT DO NOTHING
  `;
}

export async function getUserGamification(userId) {
  const result = await sql`
    SELECT * FROM user_gamification WHERE user_id = ${userId}
  `;
  return result[0] || { level: 1, points: 0, current_streak: 0, max_streak: 0 };
}
