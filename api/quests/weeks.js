// /api/quests/weeks
export default function handler(req, res) {
  const weeklyQuests = [
    {
      id: 2,
      title: "Week 2: La Liga Fury",
      startDate: "2025-01-08",
      endDate: "2025-01-14",
      grandPrizeText: "$10,000 Free Bet",
      days: [
        {
          id: 11,
          date: "2025-01-08",
          label: "Mon 8",
          title: "Goal Scorer Rush",
          provider: "La Liga",
          voucherCode: "LIGA-MON-08",
          reward: "€5 Free Bet",
          tnc: [
            "Bet min €10 on any La Liga match.",
            "Win a Single Bet where the Goal Scorer is correctly predicted.",
            "Min Odds 1.80."
          ]
        }
      ]
    }
  ];

  res.status(200).json(weeklyQuests);
}
