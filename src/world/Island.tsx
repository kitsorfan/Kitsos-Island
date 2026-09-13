import { BalloonGame } from './Balloon'
import { BoatGame } from './Boat'
import { Hide } from './Hide'
import { Buildings } from './Buildings'
import { Daylight } from './Daylight'
import { Foliage } from './Foliage'
import { GamesBoard } from './GamesBoard'
import { MotoGame } from './Moto'
import { NightLights } from './NightLights'
import { Npcs } from './Npcs'
import { Paintball } from './Paintball'
import { Party } from './Party'
import { PartyButton } from './PartyButton'
import { Paths } from './Paths'
import { Player } from './Player'
import { Proposal } from './Proposal'
import { Props } from './Props'
import { SwimWake } from './Swim'
import { swimmingPlayer } from '../game/swim'
import { Terrain } from './Terrain'
import { Water } from './Water'
import { useGame } from '../state/store'

export function Island() {
  const match = useGame((s) => s.paintball !== null)
  const riding = useGame((s) => s.moto !== null)
  const flying = useGame((s) => s.balloon !== null)
  const sailing = useGame((s) => s.rescue !== null)
  const hiding = useGame((s) => s.hide !== null)
  const night = useGame((s) => s.night)
  const party = useGame((s) => s.party)
  const amaliaHere = useGame((s) => s.amaliaHere)
  const proposal = useGame((s) => s.proposal)
  /** Keyed on the round, so asking her again is a scene and not a repaint. */
  const round = useGame((s) => s.proposalRound)
  return (
    <>
      <Daylight night={night} />

      <Terrain />
      <Water />
      <Paths />
      <Foliage />
      <Props />
      <Buildings />
      <GamesBoard />
      <PartyButton />
      <Npcs area="island" />
      {/* On the bike, up in the basket or out at sea the game owns the
          camera, so no two of them are ever driving it at once */}
      {riding ? (
        <MotoGame />
      ) : flying ? (
        <BalloonGame />
      ) : sailing ? (
        <BoatGame />
      ) : (
        <>
          <Player />
          {/* What he leaves on the water, on the one walk that ends in it */}
          <SwimWake read={swimmingPlayer} />
        </>
      )}
      {hiding && <Hide />}
      {night && <NightLights />}
      {party && <Party amalia={amaliaHere} />}
      {proposal && <Proposal key={round} />}
      {match && <Paintball />}
    </>
  )
}
