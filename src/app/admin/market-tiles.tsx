import { KpiGroup, KpiTile } from "./home-parts";
import { changeOf, trendOf, type MarketStats } from "./market-stats";

/** Buy & sell's three numbers, on Home and on the Buy & sell page. */
export function MarketTiles({ stats }: { stats: MarketStats }) {
  return (
    <KpiGroup title="Buy & sell" dot="bg-[#00BFFE]">
      <KpiTile
        href="/admin/marketplace"
        value={stats.live}
        label="Live listings"
        change={`${stats.listed.now.toLocaleString()} new in 30d · ${stats.listed.before.toLocaleString()} before`}
        trend={trendOf(stats.listed)}
        definition="For sale or rent, not test couples · trend is new listings"
      />
      <KpiTile
        href="/admin/marketplace"
        value={stats.handedOn.now}
        label="Handed on in 30d"
        change={changeOf(stats.handedOn)}
        trend={trendOf(stats.handedOn)}
        definition="Marked sold, plus rental dates booked: the item went to another couple"
      />
      <KpiTile
        href="/admin/marketplace"
        value={stats.conversations.now}
        label="Conversations in 30d"
        change={changeOf(stats.conversations)}
        trend={trendOf(stats.conversations)}
        definition="A buyer messaged a seller for the first time about a listing"
      />
    </KpiGroup>
  );
}
