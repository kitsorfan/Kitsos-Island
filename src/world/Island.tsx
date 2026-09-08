import { BalloonGame } from './Balloon'
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
import { Props } from './Props'
import { Terrain } from './Terrain'
import { Water } from './Water'
import { useGame } from '../state/store'

export function Island() {
  const match = useGame((s) => s.paintball !== null)
  const riding = useGame((s) => s.moto !== null)
  const flying = useGame((s) => s.balloon !== null)
  const night = useGame((s) => s.night)
  const party = useGame((s) => s.party)
  const amaliaHere = useGame((s) => s.amaliaHere)
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
      {/* On the bike or up in the basket the game owns the camera, so no two
          of them are ever driving it at once */}
      {riding ? <MotoGame /> : flying ? <BalloonGame /> : <Player />}
      {night && <NightLights />}
      {party && <Party amalia={amaliaHere} />}
      {match && <Paintball />}
    </>
  )
}
