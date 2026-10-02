/**
 * Greek for the interface, keyed by the English source string.
 *
 * Anything missing falls back to the English it was keyed from, so a gap reads
 * as untranslated rather than as a broken key. Keys must match the source
 * exactly, including the typographic dashes and curly apostrophes the copy uses.
 *
 * The voice is the island's: friendly, second person singular, the way you
 * would talk to somebody who has just walked in — not the voice of a form.
 * Where a sentence has a number in it, the key carries a {slot} for it and
 * the Greek puts the number wherever Greek wants it; <b>…</b> marks the part
 * that is set in bold, and may move with the words around it.
 *
 * Key names are deliberately absent — Esc, Ctrl, Shift, Space, WASD and the
 * letter keys are printed on the keyboard in Latin whatever language the page
 * is in, so they fall through untouched on purpose. The words on the round
 * buttons of the touch screen are not keys, and are translated: the legends
 * that name them are translated to match.
 */
export const UI: Record<string, string> = {
  /* ------------------------------- The tab ---------------------------- */
  'Kitsos Island - Playable CV':
    'Το Νησί του Κίτσου, ένα βιογραφικό σαν παιχνίδι',

  /* ------------------------------ the lift --------------------------- */
  'The lift': 'Το ασανσέρ',
  Floor: 'Όροφος',
  Reception: 'Υποδοχή',
  /* Τα χρόνια δίπλα στο όνομα του ορόφου. */
  '2023–2024': '2023–2024',
  '2024–present': '2024–σήμερα',
  'you are here': 'είσαι εδώ',
  'Step back out': 'Βγες έξω',
  'You are on this floor already.': 'Είσαι ήδη σε αυτόν τον όροφο.',
  'Nothing happens.': 'Δεν γίνεται τίποτα.',
  'You press it. The button does not light — but somewhere above you, something heavy shifts in the shaft.':
    'Το πατάς. Το κουμπί δεν ανάβει — κάπου από πάνω σου όμως, κάτι βαρύ κουνιέται μέσα στο φρεάτιο.',
  'The floor is there. Poured, wired, empty. The lift was built to reach it.':
    'Ο όροφος υπάρχει. Με μπετόν, με καλώδια, άδειος. Το ασανσέρ φτιάχτηκε για να φτάνει ως εκεί.',
  'IBM taught him how large systems actually fail. Veltiston AI taught him how to build one fast enough to matter, for people who feel it on a Monday morning.':
    'Η IBM τού έμαθε πώς πέφτουν στ’ αλήθεια τα μεγάλα συστήματα. Η Veltiston AI τού έμαθε να χτίζει ένα τόσο γρήγορα ώστε να κάνει τη διαφορά, για ανθρώπους που το νιώθουν από τη Δευτέρα το πρωί.',
  'So: third floor. Nobody has decided what it is yet.':
    'Και ο τρίτος όροφος; Κανείς δεν έχει αποφασίσει ακόμα τι θα είναι.',
  'You could.': 'Ίσως το αποφασίσεις εσύ.',

  /* ------------------------------- HUD ------------------------------- */
  'Kitsos Island': 'Το Νησί του Κίτσου',
  Map: 'Χάρτης',
  'Map (M)': 'Χάρτης (M)',
  Journal: 'Ημερολόγιο',
  'Journal (J)': 'Ημερολόγιο (J)',
  Games: 'Παιχνίδια',
  'Quit game': 'Έξοδος από το παιχνίδι',
  'Say hi': 'Πες ένα γεια',
  Settings: 'Ρυθμίσεις',
  Day: 'Μέρα',
  Night: 'Νύχτα',
  Torch: 'Δάδα',
  Dark: 'Σκοτάδι',
  Light: 'Φακός',
  Walk: 'Περπάτημα',
  Running: 'Τρέξιμο',
  In: 'Κοντά',
  Out: 'Μακριά',
  Next: 'Επόμενο',
  Close: 'Κλείσιμο',
  Skip: 'Προσπέραση',
  'Pick an answer': 'Διάλεξε απάντηση',
  'Not found yet': 'Δεν το βρήκες ακόμα',
  locked: 'κλειδωμένο',
  '{found}/{total} discovered': '{found}/{total} ανακαλύψεις',
  '{have} of {total} keys': '{have} από {total} κλειδιά',
  'Island games (P)': 'Παιχνίδια του νησιού (P)',
  'Flashlight, torch, or out (T)': 'Φακός, δάδα ή σβηστά (T)',
  'Keep running, the same as holding Shift':
    'Τρέχεις συνέχεια, σαν να κρατάς πατημένο το Shift',
  'Sound, music, quality, and the controls':
    'Ήχος, μουσική, ποιότητα και χειριστήρια',
  'Map, journal, games, day or night, and the camera':
    'Χάρτης, ημερολόγιο, παιχνίδια, μέρα ή νύχτα, και η κάμερα',
  'First person (X)': 'Πρώτο πρόσωπο (X)',
  'Climb (Shift)': 'Ανέβα (Shift)',
  'Sink (Ctrl)': 'Κατέβα (Ctrl)',
  'Fly up': 'Πέτα πιο ψηλά',
  'Fly down': 'Χαμήλωσε',
  'Turn the camera left (Q)': 'Γύρνα την κάμερα αριστερά (Q)',
  'Turn the camera right (E)': 'Γύρνα την κάμερα δεξιά (E)',
  'The light stays as it is until the game is over':
    'Το φως μένει όπως είναι μέχρι να τελειώσει το παιχνίδι',
  'Nothing stays alight in the water': 'Στο νερό δεν μένει τίποτα αναμμένο',
  'The lights stay out until the game is over':
    'Τα φώτα μένουν σβηστά μέχρι να τελειώσει το παιχνίδι',
  'Day or night (L)': 'Μέρα ή νύχτα (L)',

  /* ------------------------------ Live sky ---------------------------- */
  /* Το όνομα του τόπου μπαίνει μόνο του, πίσω από άνω και κάτω τελεία:
     η Αθήνα, το Τόκιο και το Ρέικιαβικ θέλουν άλλο άρθρο το καθένα, κι ένα
     «πάνω από» μπροστά σε όνομα που δεν άλλαξε διαβάζεται σαν μηχανή. */
  Live: 'Ζωντανά',
  'Live sky': 'Ζωντανός ουρανός',
  'The real sky, right now: {place}': 'Ο αληθινός ουρανός, τώρα: {place}',
  'Back to the island’s own sky': 'Πίσω στον ουρανό του νησιού',
  'Day or night by hand, which ends Live (L)':
    'Μέρα ή νύχτα με το χέρι, που κλείνει το Ζωντανά (L)',
  'Change the place or the time': 'Άλλαξε τόπο ή ώρα',
  'The sky stays as it is until the game is over':
    'Ο ουρανός μένει όπως είναι μέχρι να τελειώσει το παιχνίδι',
  Place: 'Τόπος',
  Time: 'Ώρα',
  'Search for a town…': 'Ψάξε μια πόλη…',
  'Search for a town': 'Ψάξε μια πόλη',
  'Looking…': 'Ψάχνω…',
  'The search could not be reached.':
    'Η αναζήτηση δεν απαντάει αυτή τη στιγμή.',
  'Nowhere by that name.': 'Δεν υπάρχει μέρος με αυτό το όνομα.',
  'Time of day in {place}': 'Ώρα της ημέρας: {place}',
  'Keeping time with {place}.': 'Κρατάει την ώρα του τόπου: {place}.',
  'Held at this hour. The weather is the forecast for it.':
    'Σταματημένο σε αυτή την ώρα. Ο καιρός είναι η πρόγνωση για τότε.',
  'Reading the sky…': 'Διαβάζω τον ουρανό…',
  'No forecast reached the island, so the sky stays fair. The clock still keeps time.':
    'Δεν έφτασε πρόγνωση ως το νησί, οπότε ο καιρός μένει καλός. Η ώρα πάντως μετράει κανονικά.',
  'Wind {speed} km/h': 'Άνεμος {speed} χλμ/ώ',
  'Weather by Open-Meteo.com': 'Ο καιρός από το Open-Meteo.com',
  Clear: 'Καθαρός',
  'Mostly clear': 'Σχεδόν καθαρός',
  'Partly cloudy': 'Λίγα σύννεφα',
  Overcast: 'Συννεφιά',
  Fog: 'Ομίχλη',
  Drizzle: 'Ψιχάλα',
  Rain: 'Βροχή',
  Snow: 'Χιόνι',
  Thunderstorm: 'Καταιγίδα',
  Athens: 'Αθήνα',
  Hamburg: 'Αμβούργο',
  London: 'Λονδίνο',
  'New York': 'Νέα Υόρκη',
  Tokyo: 'Τόκιο',
  Reykjavík: 'Ρέικιαβικ',
  'United Kingdom': 'Ηνωμένο Βασίλειο',
  'United States': 'ΗΠΑ',
  Japan: 'Ιαπωνία',
  Iceland: 'Ισλανδία',
  'Drag the stick to walk, tap A to interact':
    'Σύρε τον μοχλό για να περπατήσεις, πάτα A για να μιλήσεις ή να ανοίξεις κάτι',
  'WASD to walk · Shift to sprint · M for the map':
    'WASD για περπάτημα · Shift για τρέξιμο · M για τον χάρτη',
  'Space to fly · double-tap Space to drop · hold to pull up':
    'Space για να πετάξεις · διπλό Space για βουτιά · κράτα το για να ξανανέβεις',
  'Party in the plaza': 'Γλέντι στην πλατεία',
  'Press the button again to call it a night':
    'Πάτα ξανά το κουμπί για να σχολάσει το γλέντι',
  'Walk into the middle of the floor': 'Πήγαινε στη μέση της πίστας',
  /* Ο βορράς στη γωνία του μικρού χάρτη. */
  N: 'Β',

  /* ----------------------------- Settings ---------------------------- */
  Language: 'Γλώσσα',
  Music: 'Μουσική',
  Sound: 'Ήχος',
  Quality: 'Ποιότητα',
  Controls: 'Χειριστήρια',
  Off: 'Κλειστό',
  Auto: 'Αυτόματη',
  High: 'Υψηλή',
  Low: 'Χαμηλή',
  'Music volume, {level} of {max}': 'Ένταση μουσικής, {level} από {max}',
  'Sound effect volume, {level} of {max}': 'Ένταση ήχων, {level} από {max}',
  'Steps down if the island runs slow': 'Χαμηλώνει μόνη της αν το νησί κολλάει',
  'Shadows always on': 'Πάντα με σκιές',
  'Shadows off, fastest': 'Χωρίς σκιές, η πιο γρήγορη',
  'Auto found this machine short of 30fps and turned shadows off. High overrules it.':
    'Η αυτόματη ρύθμιση είδε ότι αυτός ο υπολογιστής πέφτει κάτω από τα 30fps και έκλεισε τις σκιές. Με την Υψηλή τις ξαναβάζεις.',

  /* ----------------------------- Progress ---------------------------- */
  Progress: 'Πρόοδος',
  '{found} of {total} discovered · {keys} keys':
    '{found} από {total} ανακαλύψεις · {keys} κλειδιά',
  'Clear progress': 'Διαγραφή προόδου',
  'This cannot be undone. Walk it all again?':
    'Δεν αναιρείται. Θες να ξαναπερπατήσεις το νησί από την αρχή;',
  'Clear it': 'Σβήσ’ τα',
  'Keep it': 'Άσ’ τα',
  'Progress cleared': 'Η πρόοδος σβήστηκε',
  'Starting over': 'Από την αρχή',
  'The journal, the keyring and everything found have been forgotten.':
    'Το ημερολόγιο, τα κλειδιά και ό,τι είχες βρει ξεχάστηκαν.',

  /* --------------------------- Controls list -------------------------- */
  Move: 'Κίνηση',
  Sprint: 'Τρέξιμο',
  Interact: 'Αλληλεπίδραση',
  Jump: 'Άλμα',
  'Turn camera': 'Γύρισμα κάμερας',
  Zoom: 'Ζουμ',
  'Map & travel': 'Χάρτης & ταξίδι',
  'Day / night': 'Μέρα / νύχτα',
  'Torch / flashlight': 'Δάδα / φακός',
  'Contact & CV': 'Επικοινωνία & βιογραφικό',
  'Games board': 'Πίνακας παιχνιδιών',
  'Shoot paint': 'Βολή μπογιάς',
  'Get down': 'Σκύψε',
  Wheelie: 'Σούζα',
  'Burner / vent': 'Καυστήρας / βαλβίδα',
  'Water bomb': 'Βόμβα νερού',
  Confetti: 'Κομφετί',
  'Swing the beam': 'Γύρνα τη δέσμη',
  'Wide pulse': 'Φαρδύς παλμός',
  'Back / leave': 'Πίσω / έξοδος',
  'WASD / Arrows': 'WASD / Βελάκια',
  'Space / click': 'Space / κλικ',
  'Q and R': 'Q και R',
  'A and D': 'A και D',

  /* ------------------------------ Toasts ----------------------------- */
  'Journal updated': 'Νέα σελίδα στο ημερολόγιο',
  'Key obtained': 'Βρήκες κλειδί!',
  'New mission': 'Νέα αποστολή',
  'Quality changed': 'Άλλαξε η ποιότητα',
  'Shadows off': 'Οι σκιές έκλεισαν',
  'The island was running slow, so it stepped itself down. The Quality button puts it back.':
    'Το νησί κολλούσε, οπότε χαμήλωσε μόνο του την ποιότητα. Από τις ρυθμίσεις ποιότητας το ξαναβάζεις όπως ήταν.',
  'Key taken.': 'Πήρες το κλειδί.',
  '{done} {count} of {total} keys.': '{done} {count} από {total} κλειδιά.',
  'Sticker earned': 'Κέρδισες αυτοκόλλητο!',
  'That one goes on the certificate. {count} of {total}.':
    'Αυτό μπαίνει στο πιστοποιητικό. {count} από {total}.',
  'Sealed for vacuum': 'Σφραγισμένη για το κενό',
  'You are not walking the island in this. Hang it back on the rack, or press the button.':
    'Με αυτή δεν κυκλοφορείς στο νησί. Κρέμασέ τη πίσω στην κρεμάστρα ή πάτα το κουμπί.',
  'Not like that': 'Όχι έτσι',
  'The suit is on its rack by the airlock. Nobody goes up in shirtsleeves.':
    'Η στολή είναι στην κρεμάστρα της δίπλα στον αεροθάλαμο. Στο διάστημα δεν πας με το πουκάμισο.',
  Suited: 'Έτοιμος',
  'Sealed, checked and green. The button under the glass will answer you now.':
    'Σφραγισμένη, ελεγμένη, όλα πράσινα. Το κουμπί κάτω από το τζάμι θα σε ακούσει τώρα.',
  'Blue and yellow': 'Μπλε και κίτρινο',
  'Back on the ground, in the shirt they give you for going up. It is yours — the settings card will swap it back if you would rather.':
    'Πίσω στη γη, με τη μπλούζα που σου δίνουν όταν ανέβεις εκεί πάνω. Είναι δική σου — αν προτιμάς την παλιά, την αλλάζεις από τις ρυθμίσεις.',
  'Five of five': 'Πέντε στα πέντε',
  'Every key is in hand. Unlock the Old Lighthouse, then go in.':
    'Έχεις όλα τα κλειδιά. Ξεκλείδωσε τον Παλιό Φάρο και μπες μέσα.',

  /* ---------------------------- Title screen -------------------------- */
  'A playable CV': 'Ένα βιογραφικό σαν παιχνίδι',
  /*
   * The logo is two stacked words, KITSOS over ISLAND. Greek says it the
   * other way round and with the articles — ΤΟ ΝΗΣΙ over ΤΟΥ ΚΙΤΣΟΥ — so the
   * first line takes the first half of the Greek, whatever the English word
   * on it was.
   */
  KITSOS: 'ΤΟ ΝΗΣΙ',
  ISLAND: 'ΤΟΥ ΚΙΤΣΟΥ',
  'Walk the island, talk to the townspeople and step inside the buildings. Five keys are hidden across the districts, one per building. Find them all and the Old Lighthouse on the cape opens. The Radio Center down south sends a message straight to my inbox.':
    'Γύρνα το νησί, πιάσε κουβέντα με τους κατοίκους και μπες στα κτίρια. Σε κάθε κτίριο κρύβεται ένα κλειδί, πέντε όλα κι όλα. Βρες τα και ανοίγει ο Παλιός Φάρος στο ακρωτήρι. Κι από το Ραδιοφωνικό Κέντρο, στον νότο, μου στέλνεις μήνυμα κατευθείαν στο email μου.',
  'Start exploring': 'Πάμε για εξερεύνηση',
  'In a hurry? Get the full CV and my contact details':
    'Δεν έχεις χρόνο; Δες το πλήρες βιογραφικό και στείλε μου μήνυμα εδώ',
  move: 'κίνηση',
  sprint: 'τρέξιμο',
  interact: 'αλληλεπίδραση',
  jump: 'άλμα',
  'turn camera': 'γύρισμα κάμερας',
  'map & travel': 'χάρτης & ταξίδι',
  journal: 'ημερολόγιο',
  'On a phone? Use the stick and the A button.':
    'Από κινητό; Παίζεις με τον μοχλό και το κουμπί A.',

  /* ------------------------------ Greeting ---------------------------- */
  'A word from Kitsos': 'Δυο λόγια από τον Κίτσο',
  'A word from the island’s owner': 'Δυο λόγια από τον οικοδεσπότη του νησιού',
  'Hey, nice to meet you!': 'Γεια σου! Χαίρομαι πολύ που ήρθες!',
  'Fair warning: you’ll miss all the fun.':
    'Να το ξέρεις πάντως: θα χάσεις όλη την πλάκα.',
  'The island is the good part: the people, the buildings, the five keys and the lighthouse at the end of it.':
    'Το νησί είναι το ωραίο κομμάτι: οι άνθρωποι, τα κτίρια, τα πέντε κλειδιά και ο φάρος στο τέλος.',
  'But I genuinely appreciate the time you spend on my island, and I know a CV is sometimes just a thing you need right now. So here it is, no keys required.':
    'Εκτιμώ πραγματικά τον χρόνο που περνάς στο νησί μου, και ξέρω ότι μερικές φορές απλώς χρειάζεσαι το βιογραφικό, εδώ και τώρα. Ορίστε λοιπόν, χωρίς κλειδιά.',
  'Either way, I would be very happy to connect. Say hello and I will answer. There is no one else on the other end.':
    'Όπως και να ’χει, θα χαρώ πολύ να τα πούμε. Στείλε μου ένα γεια και θα σου απαντήσω εγώ, όχι κάποιος άλλος.',
  'Open the full CV again': 'Άνοιξε ξανά το πλήρες βιογραφικό',
  'Unlock the full CV': 'Δες το πλήρες βιογραφικό',
  'Send me a message': 'Στείλε μου μήνυμα',
  '…actually, let me explore the island':
    '…για στάσου, πάω να εξερευνήσω το νησί',

  /* ------------------------------- Panel ------------------------------ */
  'The full CV': 'Το πλήρες βιογραφικό',
  'Take a copy of the CV': 'Κατέβασε το βιογραφικό',
  'Download CV': 'Λήψη βιογραφικού',
  Saved: 'Αποθηκεύτηκε',
  'Saved as a two-page PDF, the same facts you have been walking through.':
    'Αποθηκεύτηκε ως PDF δύο σελίδων, με όλα όσα είδες περπατώντας.',
  'A two-page PDF, printed from everything on this island.':
    'Ένα PDF δύο σελίδων, φτιαγμένο από όλα όσα έχει αυτό το νησί.',
  Read: 'Διάβασε',
  'The original': 'Το πρωτότυπο',
  'The original, page by page': 'Το πρωτότυπο, σελίδα σελίδα',
  'Open the signed letter': 'Άνοιξε την υπογεγραμμένη επιστολή',
  'Letter of reference from {name}': 'Συστατική επιστολή: {name}',
  'Click to read the letter.': 'Πάτα για να διαβάσεις την επιστολή.',
  'Click a name to read the letter. {count} in total.':
    'Πάτα ένα όνομα για να διαβάσεις την επιστολή. Είναι {count} συνολικά.',

  /* ------------------------------ Journal ----------------------------- */
  'Field journal': 'Ημερολόγιο εξερεύνησης',
  '{found} of {total} discovered': '{found} από {total} ανακαλύψεις',
  'Keyring: {have} of {total}': 'Κλειδιά: {have} από {total}',
  'What you have learned': 'Όσα έμαθες',
  'Nothing yet. Talk to the townspeople and step into the buildings. Everything you learn is filed here.':
    'Τίποτα ακόμα. Μίλα με τους κατοίκους και μπες στα κτίρια. Ό,τι μαθαίνεις γράφεται εδώ.',
  'Not discovered yet': 'Δεν το έχεις βρει ακόμα',
  'Island complete. You now know the whole CV. The Radio Center is waiting.':
    'Το νησί είναι δικό σου! Ξέρεις πια όλο το βιογραφικό. Το Ραδιοφωνικό Κέντρο σε περιμένει.',
  'Taken.': 'Το πήρες.',

  /* -------------------------------- Map ------------------------------- */
  'Island map': 'Χάρτης του νησιού',
  '{keys} / {total} keys · {places} / {all} places found':
    '{keys} / {total} κλειδιά · {places} / {all} μέρη',
  'Step outside first': 'Βγες πρώτα έξω',
  'Travel to {place}': 'Μετάβαση: {place}',
  Missions: 'Αποστολές',
  'The Old Lighthouse': 'Ο Παλιός Φάρος',
  'Open. The keeper’s logbook is at the top.':
    'Ανοιχτός. Το ημερολόγιο του φαροφύλακα είναι στην κορυφή.',
  'Sealed with five locks. {have} of {total} turned.':
    'Σφραγισμένος με πέντε κλειδαριές. Έχουν γυρίσει οι {have} από τις {total}.',
  'Step outside to travel.': 'Βγες έξω για να ταξιδέψεις.',
  'Click a place you have found to travel there.':
    'Πάτα ένα μέρος που έχεις βρει για να πας κατευθείαν εκεί.',
  /* Οι επιγραφές έξω στο νησί. */
  'NATIONAL TECHNICAL UNIVERSITY OF ATHENS': 'ΕΘΝΙΚΟ ΜΕΤΣΟΒΙΟ ΠΟΛΥΤΕΧΝΕΙΟ',
  'GIVE BLOOD / SIGN UP': 'ΔΩΣΕ ΑΙΜΑ / ΓΡΑΨΟΥ ΕΘΕΛΟΝΤΗΣ',
  VOLUNTEERS: 'ΕΘΕΛΟΝΤΕΣ',
  /* Η πλάκα με τις πέντε κλειδαριές, δίπλα στην πόρτα του φάρου. */
  Open: 'Ανοιχτό',
  '{have} / 5 keys': '{have} / 5 κλειδιά',

  /* ---------------------------- Arcade board -------------------------- */
  'Games board · Town Plaza': 'Πίνακας παιχνιδιών · Κεντρική Πλατεία',
  'Island Games': 'Παιχνίδια του Νησιού',
  'ISLAND GAMES': 'ΠΑΙΧΝΙΔΙΑ ΤΟΥ ΝΗΣΙΟΥ',
  'Four in daylight, one after the lamps go out. Leave any of them with Esc.':
    'Τέσσερα παίζονται μέρα και ένα αφού πέσει το σκοτάδι. Από όποιο θες βγαίνεις με Esc.',
  'Behind five locks. Find every district key first.':
    'Πίσω από πέντε κλειδαριές. Βρες πρώτα όλα τα κλειδιά των συνοικιών.',
  'After dark only. Press L.': 'Μόνο όταν νυχτώσει. Πάτα L.',
  'Daylight only. Press L.': 'Μόνο με το φως της μέρας. Πάτα L.',
  'After dark only.': 'Μόνο όταν νυχτώσει.',
  'Daylight only.': 'Μόνο με το φως της μέρας.',

  /* ----------------------- Clocks, distances, counts ------------------ */
  /* Λεπτά και δευτερόλεπτα, και η υποδιαστολή είναι κόμμα. */
  '{m}m {s}s': '{m}λ {s}δ',
  '{s}s': '{s}δ',
  '{s}.{tenth}s': '{s},{tenth}δ',
  '{m}:{ss}.{tenth}': '{m}:{ss},{tenth}',
  '{whole}.{part} km': '{whole},{part} χλμ',
  '{metres}m': '{metres}μ',
  'of {total}': 'από {total}',

  /* ------------------------------ Balloon ----------------------------- */
  'Balloon drop': 'Ρίψεις από αερόστατο',
  'Flight {round}': 'Πτήση {round}',
  'Up over the town': 'Πάνω από την πόλη',
  'Nobody left waiting': 'Δεν έμεινε κανείς να περιμένει',
  'It is festival afternoon, and the balloon is tethered on Collaboration Road. <b>{count} gatherings</b> are spread across the island below, and every one of them is waiting on something out of your basket.':
    'Είναι απόγευμα γιορτής και το αερόστατο είναι δεμένο στην Οδό Συνεργασίας. Από κάτω, σε όλο το νησί, περιμένουν <b>{count} παρέες</b>, και η καθεμιά θέλει κάτι από το καλάθι σου.',
  '{count} want a water bomb': '{count} θέλουν βόμβα νερού',
  '{count} want confetti': '{count} θέλουν κομφετί',
  'Out in the sun on the roads and the parade ground. A bomb drops like a stone, so it lands close to under you, and everyone it catches scatters, hands over their heads.':
    'Όσοι λιάζονται στους δρόμους και στο προαύλιο. Η βόμβα πέφτει σαν πέτρα, σχεδόν ακριβώς από κάτω σου, και όποιον πετύχει το βάζει στα πόδια με τα χέρια στο κεφάλι.',
  'Something to celebrate, at the doors and in the gardens. Confetti floats down, so it drifts a long way past the bomb, and everyone under it cheers.':
    'Όσοι έχουν κάτι να γιορτάσουν, στις πόρτες και στους κήπους. Το κομφετί πέφτει αργά, οπότε ο αέρας το πάει πολύ πιο μακριά από τη βόμβα, κι όποιος βρεθεί από κάτω πανηγυρίζει.',
  'Two rings follow you across the grass: the blue one is where a bomb would land, the pink one where confetti would. Line the right ring up with the right gathering.':
    'Δύο κύκλοι σε ακολουθούν στο γρασίδι: ο μπλε δείχνει πού θα πέσει η βόμβα, ο ροζ πού θα πέσει το κομφετί. Βάλε τον σωστό κύκλο πάνω από τη σωστή παρέα.',
  'The basket holds {count} of each and a fresh one comes up every couple of seconds, so there is no running out, only waiting.':
    'Το καλάθι χωράει {count} από το καθένα και κάθε δυο δευτερόλεπτα έρχεται καινούργιο, οπότε δεν ξεμένεις ποτέ· απλώς περιμένεις λίγο.',
  'Drop the wrong thing on somebody and they stay on the list. Nothing is timed against you; the clock only counts the flight.':
    'Αν ρίξεις σε κάποιον το λάθος, απλώς συνεχίζει να περιμένει. Ο χρόνος δεν σε πιέζει· το ρολόι μετράει μόνο πόσο κράτησε η πτήση.',
  'All {count} of them served, and the whole island seen from the one place you cannot walk to.':
    'Και οι {count} πήραν αυτό που ήθελαν, κι εσύ είδες όλο το νησί από το μόνο σημείο όπου δεν φτάνεις με τα πόδια.',
  Drift: 'Κίνηση',
  Stick: 'Μοχλός',
  Climb: 'Άνοδος',
  'Hold UP': 'Κράτα ΠΑΝΩ',
  'Hold DOWN': 'Κράτα ΚΑΤΩ',
  Sink: 'Κάθοδος',
  '💧 button': 'Κουμπί 💧',
  '🎉 button': 'Κουμπί 🎉',
  'Lean into the drift': 'Γείρε μπρος-πίσω',
  'Swing the basket': 'Γύρνα το καλάθι',
  'Burner: climb': 'Καυστήρας: άνοδος',
  'Vent: drop': 'Βαλβίδα: κάθοδος',
  'Hold Shift': 'Κράτα Shift',
  'Hold Ctrl': 'Κράτα Ctrl',
  'Come down': 'Προσγείωση',
  'Cast off': 'Λύσε τα σκοινιά',
  'Fly again': 'Ξανά στον αέρα',
  Served: 'Ευχαριστημένοι',
  'Parcels dropped': 'Ρίψεις',
  'On the mark': 'Ευστοχία',
  'Wrong parcel': 'Λάθος ρίψεις',
  'Time aloft': 'Χρόνος στον αέρα',
  'of {total} served': 'από {total} παρέες',
  Bombs: 'Βόμβες',
  'm up': 'μ ύψος',
  'km/h': 'χλμ/ώρα',
  Burner: 'Καυστήρας',
  'Everyone served': 'Όλοι ευχαριστημένοι',
  '{place}: <b>{metres}m</b>': '{place}: <b>{metres}μ</b>',
  '{place}: {left} to go': '{place}: μένουν {left}',
  'Every one of them served.': 'Όλοι πήραν αυτό που ήθελαν!',
  'Soaked. They were waiting on confetti': 'Μούσκεμα! Αυτοί περίμεναν κομφετί',
  'Confetti on the ones who wanted cooling down':
    'Κομφετί σε όσους ήθελαν να δροσιστούν',

  /* ---------------------------- Hide and seek ------------------------- */
  'Hide and seek · after dark': 'Κρυφτό · μετά το σούρουπο',
  'Game {round}': 'Παιχνίδι {round}',
  'Lights out on the island': 'Σβήνουν τα φώτα στο νησί',
  'Every one of them found': 'Τους βρήκες όλους',
  'Never found you': 'Δεν σε βρήκαν ποτέ',
  'Found you': 'Σε βρήκαν',
  'Every lamp on the island goes out: the windows, the lighthouse, the searchlight over the camp. The only light left anywhere is whatever somebody is carrying.':
    'Σβήνουν όλα τα φώτα στο νησί: τα παράθυρα, ο φάρος, ο προβολέας πάνω από το στρατόπεδο. Το μόνο φως που μένει είναι ό,τι κρατάει ο καθένας στο χέρι.',
  /* «Τα φυλάω» λέμε στο κρυφτό γι’ αυτόν που ψάχνει. */
  'You seek': 'Τα φυλάς εσύ',
  'You hide': 'Κρύβεσαι εσύ',
  'All {count} of them hide. Go and find them with your torch.':
    'Κρύβονται και οι {count}. Βρες τους με τη δάδα σου.',
  '{seconds} seconds to disappear, then all {count} come looking.':
    'Έχεις {seconds} δευτερόλεπτα να εξαφανιστείς, και μετά βγαίνουν να σε ψάξουν και οι {count}.',
  'Shining a light on somebody is not finding them. You have to <b>walk up and touch them</b>.':
    'Δεν φτάνει να ρίξεις φως σε κάποιον. Πρέπει να <b>πας και να τον αγγίξεις</b>.',
  'Keep the torch <b>lit</b>, or you will walk past every one of them in the dark. Nothing tells you where they are. They are behind things.':
    'Κράτα τη δάδα <b>αναμμένη</b>, αλλιώς θα τους προσπεράσεις όλους στο σκοτάδι. Τίποτα δεν σου λέει πού είναι. Κρύβονται πίσω από πράγματα.',
  'Nothing is timed against you. The clock only says how long it took to find all {count}.':
    'Ο χρόνος δεν σε πιέζει. Το ρολόι απλώς μετράει πόση ώρα σου πήρε να βρεις και τους {count}.',
  '<b>{seconds} seconds</b> while they count. After that every one of them is out with a torch.':
    '<b>{seconds} δευτερόλεπτα</b> όσο μετράνε. Μετά βγαίνουν όλοι με δάδες.',
  'Stay out of their hands for <b>{seconds} seconds</b> and you have won the night. Being seen is not being caught. Somebody has to reach you, the same rule you play by the other way round.':
    'Μείνε μακριά από τα χέρια τους για <b>{seconds} δευτερόλεπτα</b> και η βραδιά είναι δική σου. Αν σε δουν, δεν σημαίνει ότι σε έπιασαν. Κάποιος πρέπει να σε φτάσει, με τον ίδιο κανόνα που παίζεις κι εσύ όταν τα φυλάς.',
  '<b>They run when they see you</b>, and a shade faster than you can. Speed is no way out of it. Get something solid between you and them and they will lose you.':
    '<b>Μόλις σε δουν, τρέχουν</b>, και λίγο πιο γρήγορα από σένα. Με την ταχύτητα δεν γλιτώνεις. Βάλε κάτι συμπαγές ανάμεσα σε σένα κι αυτούς και θα σε χάσουν.',
  '<b>Anything you do draws them.</b> Walking is heard from a good way off, crouch-walking from barely any, and a lit torch is seen right across the town, so everyone inside that range stops looking where they were and comes to look at you.':
    '<b>Ό,τι κι αν κάνεις, τους τραβάει.</b> Το περπάτημα ακούγεται από μακριά, το σκυφτό περπάτημα σχεδόν καθόλου, και μια αναμμένη δάδα φαίνεται από την άλλη άκρη της πόλης· όποιος είναι μέσα σε αυτή την απόσταση αφήνει ό,τι έψαχνε κι έρχεται να ψάξει εσένα.',
  '<b>Still and dark is safe</b>, up to a point. Every so often one of them takes it into their head to come and look exactly where you are anyway.':
    '<b>Ακίνητος και στο σκοτάδι είσαι ασφαλής</b>, ως ένα σημείο. Κάθε τόσο κάποιος το βάζει στο μυαλό του να έρθει να ψάξει ακριβώς εκεί που είσαι.',
  'All {count} of them out of the dark, one torch beam at a time.':
    'Βγήκαν και οι {count} από το σκοτάδι, ένας ένας, στο φως της δάδας σου.',
  '{seconds} seconds with the whole island looking, and not one of them got a beam on you.':
    '{seconds} δευτερόλεπτα σε έψαχνε όλο το νησί, και κανείς δεν σε έπιασε στο φως του.',
  'Somebody held a light on you just long enough to be sure.':
    'Κάποιος σε κράτησε στο φως του αρκετά για να είναι σίγουρος.',
  Took: 'Χρόνος',
  Needed: 'Στόχος',
  'Start counting': 'Άρχισε να μετράς',
  'Go and hide': 'Τρέξε να κρυφτείς',
  Again: 'Ξανά',
  'Lights back on': 'Ανάψτε τα φώτα',
  'Hide and seek: seeking': 'Κρυφτό: τα φυλάς',
  'Hide and seek: hiding': 'Κρυφτό: κρύβεσαι',
  'of {total} found': 'από {total} βρέθηκαν',
  'Somebody is very close.': 'Κάποιος είναι πολύ κοντά.',
  'Something is near here.': 'Κάτι υπάρχει εδώ κοντά.',
  'Walk up and touch them. A light is not enough.':
    'Πλησίασε και άγγιξέ τους. Το φως δεν φτάνει.',
  '{count} AFTER YOU: {metres}m': 'ΣΤΟ ΚΑΤΟΠΙ ΣΟΥ: {count} · {metres}μ',
  SEEN: 'ΣΕ ΕΙΔΑΝ',
  'Nobody has seen you': 'Δεν σε έχει δει κανείς',
  'Torch lit': 'Δάδα αναμμένη',
  'That torch is visible right across the town · anyone inside {metres}m is on their way':
    'Η δάδα σου φαίνεται από όλη την πόλη · όποιος είναι ως {metres}μ έρχεται',
  'They can hear you moving · anyone inside {metres}m is on their way':
    'Σε ακούνε που κινείσαι · όποιος είναι ως {metres}μ έρχεται',
  'Found. {left} still out there': 'Βρέθηκε! Μένουν ακόμα {left}',
  'Somebody has seen you.': 'Κάποιος σε είδε.',
  'Caught.': 'Σε έπιασαν.',
  'Keep low': 'Σκύψε',
  DUCK: 'ΣΚΥΨΕ',
  /* Και ως κουμπί στον πίνακα των πλήκτρων, και ως κατάσταση στο παιχνίδι. */
  'Torch out': 'Δάδα σβηστή',
  'Give up': 'Τα παρατάω',
  Found: 'Βρέθηκαν',
  'Held out': 'Άντεξες',
  'They are still counting. Get out of sight.':
    'Μετράνε ακόμα. Τρέξε να κρυφτείς!',
  'Your torch is out. Press T or you will never see them at all':
    'Η δάδα σου είναι σβηστή. Πάτα T, αλλιώς δεν θα δεις κανέναν',
  'seconds to hold out': 'δευτερόλεπτα ακόμα',

  /* ------------------------------- Moto ------------------------------- */
  'Island Circuit': 'Πίστα του Νησιού',
  'Race {round}': 'Αγώνας {round}',
  'One lap of the island': 'Ένας γύρος του νησιού',
  'Three laps of the island': 'Τρεις γύροι του νησιού',
  'Five laps of the island': 'Πέντε γύροι του νησιού',
  '{count} laps of the island': '{count} γύροι του νησιού',
  'Won it': 'Νίκη!',
  'Second across the line': 'Δεύτερος στον τερματισμό',
  'Third across the line': 'Τρίτος στον τερματισμό',
  'Fourth across the line': 'Τέταρτος στον τερματισμό',
  'The ring road runs right round the town, through the woods and across all seven district roads: <b>{metres} metres</b> of it, {times}. Three of the islanders are on the grid ahead of you, and you start at the back of it.':
    'Ο περιφερειακός κάνει όλο τον γύρο της πόλης, μέσα από το δάσος και πάνω από όλους τους εφτά δρόμους των συνοικιών: <b>{metres} μέτρα</b> ο γύρος, {times}. Τρεις νησιώτες περιμένουν ήδη στην εκκίνηση μπροστά σου, κι εσύ ξεκινάς τελευταίος.',
  once: 'μία φορά',
  '{count} times': '{count} φορές',
  Brake: 'Φρένο',
  'Pull the stick back': 'Τράβα τον μοχλό πίσω',
  'Hold WHEELIE': 'Κράτα ΣΟΥΖΑ',
  'Hold GAS': 'Κράτα ΓΚΑΖΙ',
  'Hold BRAKE': 'Κράτα ΦΡΕΝΟ',
  'The arrows on the left': 'Τα βελάκια αριστερά',
  'Steer left': 'Στρίψε αριστερά',
  'Steer right': 'Στρίψε δεξιά',
  Gas: 'Γκάζι',
  Steer: 'Τιμόνι',
  'Hold Space': 'Κράτα Space',
  Retire: 'Εγκατάλειψη',
  'Stay on the tarmac. The grass will not hold a bike much above half speed, and the forest between the roads is thick.':
    'Μείνε στην άσφαλτο. Στο χορτάρι η μηχανή δεν κρατιέται πολύ πάνω από τη μισή ταχύτητα, και το δάσος ανάμεσα στους δρόμους είναι πυκνό.',
  'Cutting the middle of the island does not shorten the lap. You have to come past every sector of the circuit for it to count.':
    'Αν κόψεις δρόμο από τη μέση του νησιού, ο γύρος δεν μικραίνει. Για να μετρήσει, πρέπει να περάσεις από κάθε τομέα της πίστας.',
  'Sit right behind one of them and the tow pulls you along faster than the bike will go on its own. That is the way past on a road this narrow.':
    'Κόλλα ακριβώς πίσω από κάποιον και η ρουφήχτρα σε τραβάει πιο γρήγορα απ’ ό,τι πάει η μηχανή μόνη της. Έτσι προσπερνάς σε τόσο στενό δρόμο.',
  'A shoulder in the corners costs a little speed and no more. They will give you room if you are quicker.':
    'Ένα σπρώξιμο στις στροφές σού κοστίζει λίγη ταχύτητα, τίποτα παραπάνω. Αν είσαι πιο γρήγορος, θα σου κάνουν χώρο.',
  'Round the ring road, and nobody came past you on the last lap.':
    'Ολόκληρος ο περιφερειακός, και στον τελευταίο γύρο δεν σε πέρασε κανείς.',
  'On the podium, and close enough to see the winner over the line.':
    'Στο βάθρο, και τόσο κοντά που είδες τον νικητή να περνάει τη γραμμή.',
  'Round the back of the field the whole way. The line is there to be learned.':
    'Όλη τη διαδρομή στο πίσω μέρος. Την καλή γραμμή τη μαθαίνεις με τον καιρό.',
  Finished: 'Θέση',
  Fourth: 'Τέταρτος',
  'Race time': 'Χρόνος αγώνα',
  'Best lap': 'Καλύτερος γύρος',
  'Best lap <b>{time}</b>': 'Καλύτερος γύρος <b>{time}</b>',
  'On the grid': 'Στην εκκίνηση',
  'Race again': 'Ξανά αγώνας',
  'Off the bike': 'Κατέβα από τη μηχανή',
  'Hold it': 'Περίμενε…',
  'of 4': 'από 4',
  'Lap {lap}/{laps}': 'Γύρος {lap}/{laps}',
  '1st': '1ος',
  '2nd': '2ος',
  '3rd': '3ος',
  '4th': '4ος',
  leader: 'πρώτος',
  '+{gap}m': '+{gap}μ',
  'Off the circuit': 'Εκτός πίστας',
  Tow: 'Ρουφήχτρα',
  You: 'Εσύ',
  Someone: 'Κάποιος',

  /* ----------------------------- Paintball ---------------------------- */
  Paintball: 'Πέιντμπολ',
  'Paintball mode': 'Ώρα για πέιντμπολ',
  'Round {round}': 'Γύρος {round}',
  'Pick up the marker': 'Πιάσε το όπλο',
  'Field cleared': 'Καθάρισες το γήπεδο',
  'Painted out': 'Σε έβαψαν',
  'The island splits in two for an afternoon, and the sides are never the same twice. Whoever picked up a marker for you is standing in the plaza; everyone else is out in the fields.':
    'Το νησί χωρίζεται στα δύο για ένα απόγευμα, και οι ομάδες δεν βγαίνουν ποτέ ίδιες. Όσοι πήραν όπλο με το μέρος σου περιμένουν στην πλατεία· όλοι οι άλλοι είναι έξω στα χωράφια.',
  'On your side: {count} of {max}': 'Με το μέρος σου: {count} από {max}',
  'Nobody yet. Tap a name and they will pick up a marker for you; leave it empty and the afternoon is yours alone.':
    'Κανείς ακόμα. Πάτα ένα όνομα και θα πάρει όπλο μαζί σου· αν δεν διαλέξεις κανέναν, παίζεις μόνος σου όλο το απόγευμα.',
  'Tap a name to take them off it. Whoever you leave out lines up against you.':
    'Πάτα ένα όνομα για να βγει από την ομάδα. Όποιον αφήσεις απ’ έξω, θα παίξει εναντίον σου.',
  'Against you: {count}': 'Εναντίον σου: {count}',
  'The island, plus enough of the next village along to make up the numbers.':
    'Όλο το νησί, κι όσοι χρειάστηκε από το διπλανό χωριό για να βγουν τα νούμερα.',
  'Islanders, spread across the fields around the plaza.':
    'Νησιώτες, σκορπισμένοι στα χωράφια γύρω από την πλατεία.',
  'Draw both sides again': 'Ξαναφτιάξε τις ομάδες',
  '<b>{rounds} rounds</b> per hopper, then a {seconds}-second refill.':
    '<b>{rounds} βολές</b> ανά γεμιστήρα, και μετά {seconds} δευτερόλεπτα για γέμισμα.',
  '<b>{lives} lives</b>. A ball to the chest costs one.':
    '<b>{lives} ζωές</b>. Κάθε μπάλα στο στήθος σού τρώει μία.',
  '<b>Get down</b> (Ctrl, or the DUCK button) and their paint sails over you, but you cannot shoot back from down there. Cover costs you the shot.':
    '<b>Σκύψε</b> (Ctrl ή το κουμπί ΣΚΥΨΕ) και η μπογιά τους περνάει από πάνω σου, αλλά από κάτω δεν μπορείς να απαντήσεις. Η κάλυψη σού κοστίζει τη βολή.',
  '<b>{seconds} seconds</b> on the clock before anybody may fire. Use them to get behind something.':
    '<b>{seconds} δευτερόλεπτα</b> πριν επιτραπεί σε οποιονδήποτε να ρίξει. Εκμεταλλέψου τα για να κρυφτείς πίσω από κάτι.',
  'Your marker leads whichever enemy you are facing. A ring marks them. Paint a friend and you lose them.':
    'Το όπλο σου σημαδεύει όποιον αντίπαλο έχεις μπροστά σου. Ένας κύκλος τον δείχνει. Αν βάψεις δικό σου, τον χάνεις.',
  'Every last one of them is sitting in the grass. You painted {hits} of {total} yourself.':
    'Κάθονται όλοι στο χορτάρι, μέχρι τον τελευταίο. Εσύ έβαψες τους {hits} από τους {total}.',
  'Three hits and the afternoon is over. {painted} of {total} went down first.':
    'Τρία χτυπήματα και το απόγευμα τελείωσε. Πρόλαβαν να πέσουν {painted} από τους {total}.',
  'Painted by you': 'Έβαψες εσύ',
  'Team total': 'Σύνολο ομάδας',
  'Lives left': 'Ζωές που έμειναν',
  'Friendly fire': 'Φίλια πυρά',
  'Start the match': 'Ξεκίνα τον αγώνα',
  Rematch: 'Ρεβάνς',
  'Back to the island': 'Πίσω στο νησί',
  'Markers down until the whistle': 'Όπλα κάτω μέχρι το σφύριγμα',
  Lives: 'Ζωές',
  Hopper: 'Γεμιστήρας',
  'Down. You cannot shoot from here':
    'Είσαι σκυμμένος. Από εδώ δεν μπορείς να ρίξεις',
  'Refilling: {s}s': 'Γέμισμα: {s}δ',
  '{ammo} of {max} rounds': '{ammo} από {max} βολές',
  '<b>{count}</b> left': 'μένουν <b>{count}</b>',
  '<b>{count}</b> against you': '<b>{count}</b> απέναντί σου',
  '<b>{count}</b> painted': '<b>{count}</b> βαμμένοι',
  /*
   * Ό,τι πέφτει στο γήπεδο, όπως το λέει ο εκφωνητής: το όνομα μετά την
   * άνω κάτω τελεία, ώστε να μη χρειάζεται άρθρο — ο Τάσος, η Ζωή — που
   * δεν το ξέρει μια φράση γραμμένη μία φορά για όλους.
   */
  '{name} was on your side!': 'Φίλια πυρά: {name}!',
  'You painted {name}': 'Εύστοχη βολή: {name}',
  '{name} is out': 'Εκτός: {name}',
  'Painted out.': 'Σε έβαψαν. Τέλος.',
  'Hit! {lives} life left': 'Σε πέτυχαν! Σου μένει {lives} ζωή',
  'Hit! {lives} lives left': 'Σε πέτυχαν! Σου μένουν {lives} ζωές',

  /* ------------------------------ Rescue ------------------------------ */
  'Sea rescue': 'Θαλάσσια διάσωση',
  Mayday: 'Mayday',
  'Run {round}': 'Αποστολή {round}',
  'Take the lifeboat out': 'Βγες με τη σωστική λέμβο',
  'Everyone aboard': 'Όλοι στο σκάφος',
  'A flare went out': 'Έσβησε μια φωτοβολίδα',
  'A boat went down off the coast in the night and her people are in the water in rafts. <b>{count} of them</b> will put up hand flares over the next few minutes, and a hand flare burns for a little over a minute. After that there is nothing left out there to steer by.':
    'Ένα σκάφος βούλιαξε τη νύχτα ανοιχτά της ακτής και οι άνθρωποί του είναι στο νερό, σε σχεδίες. <b>{count} από αυτούς</b> θα ανάψουν φωτοβολίδες τα επόμενα λεπτά, και μια φωτοβολίδα χειρός καίει λίγο παραπάνω από ένα λεπτό. Μετά δεν μένει τίποτα εκεί έξω για να σε οδηγήσει.',
  Throttle: 'Γκάζι',
  Astern: 'Όπισθεν',
  Helm: 'Πηδάλιο',
  'Stick left and right': 'Μοχλός αριστερά-δεξιά',
  Chart: 'Χάρτης',
  'Put in': 'Επιστροφή στο λιμάνι',
  'Get alongside a raft and <b>take the way off her</b>. Nobody can climb a net at speed, so the last twenty metres are done on nothing but what she is already carrying.':
    'Πλεύρισε μια σχεδία και <b>κόψε ταχύτητα</b>. Κανείς δεν σκαρφαλώνει σε δίχτυ με το σκάφος να τρέχει, οπότε τα τελευταία είκοσι μέτρα τα κάνεις μόνο με όση φόρα έχεις ήδη.',
  'The ring on the water round the boat goes green the moment she is slow enough, and the ring round the raft fills as they come over. Open the throttle and it empties again.':
    'Ο κύκλος στο νερό γύρω από το σκάφος γίνεται πράσινος μόλις κόψεις αρκετά ταχύτητα, κι ο κύκλος γύρω από τη σχεδία γεμίζει καθώς ανεβαίνουν. Αν δώσεις γκάζι, αδειάζει ξανά.',
  'The panel lists every flare in the water, shortest first, and that order is the only real decision in the game. Let one burn out and the run is over.':
    'Ο πίνακας δείχνει κάθε φωτοβολίδα στο νερό, πρώτη αυτή που σβήνει πιο σύντομα, κι αυτή η σειρά είναι η μόνη πραγματική απόφαση του παιχνιδιού. Αν αφήσεις μία να σβήσει, τέλος.',
  'Every one of them off the water and under the shelter aft. They will all have a story about the boat that came.':
    'Όλοι έξω από το νερό, κάτω από το στέγαστρο στην πρύμνη. Θα έχουν όλοι να λένε για το σκάφος που ήρθε να τους πάρει.',
  'One of the flares went out before you got there, and a raft in the dark is a raft nobody finds. The others are still out there.':
    'Μια φωτοβολίδα έσβησε πριν φτάσεις, και μια σχεδία στο σκοτάδι δεν τη βρίσκει κανείς. Οι υπόλοιποι είναι ακόμα εκεί έξω.',
  'Out again': 'Ξανά στη θάλασσα',
  'Back on the dock': 'Πίσω στην προβλήτα',
  'Taken aboard': 'Διασώθηκαν',
  'Time at sea': 'Χρόνος στη θάλασσα',
  'of {total} aboard': 'από {total} στο σκάφος',
  'No flares in the water': 'Καμία φωτοβολίδα στο νερό',
  'Coming aboard': 'Ανεβαίνουν',
  '1 raft out there': '1 σχεδία εκεί έξω',
  '{count} rafts out there': '{count} σχεδίες εκεί έξω',
  kn: 'κόμβοι',
  Aground: 'Προσάραξες!',
  'Hold her': 'Κράτα το σταθερό',
  'Too fast': 'Πολύ γρήγορα',

  /* ---------------------------- Radio console ------------------------- */
  'Channel 1 · Email': 'Κανάλι 1 · Email',
  Clipboard: 'Πρόχειρο',
  'Copy address': 'Αντιγραφή διεύθυνσης',
  'Copy profile': 'Αντιγραφή προφίλ',
  'Copy message': 'Αντιγραφή μηνύματος',
  'Copied ✓': 'Αντιγράφηκε ✓',
  'Channel 2 · LinkedIn': 'Κανάλι 2 · LinkedIn',
  'Channel 3 · Message desk': 'Κανάλι 3 · Γραφείο μηνυμάτων',
  'This island has no backend. The desk hands your message to your own mail client, already addressed and written.':
    'Αυτό το νησί δεν έχει backend. Το γραφείο δίνει το μήνυμά σου στο δικό σου πρόγραμμα email, έτοιμο γραμμένο και με τη διεύθυνσή μου.',
  'Your name': 'Το όνομά σου',
  'Your email': 'Το email σου',
  /* Ένα ελληνικό όνομα για παράδειγμα, στη θέση της Ada Lovelace. */
  'Ada Lovelace': 'Μαρία Παπαδοπούλου',
  'ada@example.com': 'maria@example.com',
  Subject: 'Θέμα',
  /* Μόνο αυτό που βλέπεις· αυτό που φτάνει στα εισερχόμενα μένει αγγλικό. */
  'A role I think you would fit': 'Μια θέση που νομίζω ότι σου ταιριάζει',
  'Freelance / collaboration': 'Freelance / συνεργασία',
  'Technical question': 'Τεχνική ερώτηση',
  'Just saying hello': 'Απλώς ένα γεια',
  Message: 'Μήνυμα',
  '📡 Transmit': '📡 Αποστολή',
  'Hi Kitsos, I found you on your island…':
    'Γεια σου Κίτσο, σε βρήκα στο νησί σου…',
  'Messages from this desk come straight to my inbox. Leave an address and I will write back.':
    'Ό,τι στέλνεις από εδώ έρχεται κατευθείαν στο email μου. Άφησε τη διεύθυνσή σου και θα σου απαντήσω.',
  '📡 Transmitting…': '📡 Στέλνεται…',
  'Message sent!': 'Το μήνυμα στάλθηκε!',
  'Thanks, {name}! Your message has landed in my inbox, and I will write back to {email}.':
    'Ευχαριστώ, {name}! Το μήνυμά σου έφτασε και θα σου απαντήσω στο {email}.',
  'Thanks! Your message has landed in my inbox, and I will write back to {email}.':
    'Ευχαριστώ! Το μήνυμά σου έφτασε και θα σου απαντήσω στο {email}.',
  'Send another message': 'Στείλε κι άλλο μήνυμα',
  'Signal sent to your mail client. If nothing opened, copy the message instead. The address is {email}.':
    'Το μήνυμα πήγε στο πρόγραμμα email σου. Αν δεν άνοιξε τίποτα, αντίγραψε το μήνυμα. Η διεύθυνση είναι {email}.',
  'That email address does not look right. I need it to reply.':
    'Αυτό το email δεν μοιάζει σωστό, και το χρειάζομαι για να σου απαντήσω.',
  'That name is too long for the desk.':
    'Το όνομα είναι πολύ μεγάλο για το γραφείο.',
  'The message is empty, or longer than the desk can carry.':
    'Το μήνυμα είναι άδειο ή πιο μεγάλο απ’ όσο χωράει.',
  'Pick one of the subjects on the list.':
    'Διάλεξε ένα από τα θέματα της λίστας.',
  'The check that you are a person did not pass. Try once more.':
    'Ο έλεγχος ότι είσαι άνθρωπος δεν πέρασε. Δοκίμασε ξανά.',
  'Too many messages in a minute. Wait a little and try again.':
    'Πολλά μηνύματα μέσα σε ένα λεπτό. Περίμενε λίγο και ξαναδοκίμασε.',
  'The transmitter is down. Your message is still here: send it from your own mail client instead.':
    'Ο πομπός δεν λειτουργεί αυτή τη στιγμή. Το μήνυμά σου είναι ακόμα εδώ: στείλ’ το από το δικό σου πρόγραμμα email.',
  'Open it in my mail client': 'Άνοιξέ το στο πρόγραμμα email μου',

  /* --------------------------- Buttons and titles -------------------- */

  'Open the map': 'Άνοιξε τον χάρτη',
  'Open the map (M)': 'Άνοιξε τον χάρτη (M)',
  'Contact & full CV (G)': 'Επικοινωνία & πλήρες βιογραφικό (G)',
  'Zoom in (Z, = or the wheel)': 'Μεγέθυνση (Z, = ή ροδέλα)',
  'Zoom out (C, - or the wheel)': 'Σμίκρυνση (C, - ή ροδέλα)',
  'First person': 'Πρώτο πρόσωπο',
  Laps: 'Γύροι',
  Grade: 'Δυσκολία',

  /* ------------------------- On-screen controls ---------------------- */

  'Drop a water bomb': 'Ρίξε βόμβα νερού',
  'Throw confetti': 'Πέτα κομφετί',
  /* Οι λέξεις πάνω στα στρογγυλά κουμπιά της οθόνης αφής. */
  UP: 'ΠΑΝΩ',
  DOWN: 'ΚΑΤΩ',
  GAS: 'ΓΚΑΖΙ',
  BRAKE: 'ΦΡΕΝΟ',
  WHEELIE: 'ΣΟΥΖΑ',
  FIRE: 'ΠΥΡ',
  PULSE: 'ΠΑΛΜΟΣ',

  /* ---------------------------- Key legends -------------------------- */

  /*
   * What each control does, alongside the key that does it. The keys
   * themselves stay as they are printed — a Greek keyboard has the same W
   * and the same Shift on it — while the words on the touch buttons follow
   * the buttons, which are in Greek.
   */
  'out of his own eyes': 'μέσα από τα μάτια του',
  'zoom in and out': 'ζουμ',
  'W and S': 'W και S',
  'Q and E': 'Q και E',
  'Z and C, or the wheel': 'Z και C, ή η ροδέλα',
  drift: 'κίνηση',
  climb: 'άνοδος',
  'climb and sink': 'πάνω και κάτω',
  drop: 'ρίψη',
  turn: 'στροφή',
  burner: 'καυστήρας',
  vent: 'βαλβίδα',
  bomb: 'βόμβα',
  confetti: 'κομφετί',
  'hold it': 'κράτα το',
  'gas & brake': 'γκάζι & φρένο',
  steer: 'τιμόνι',
  wheelie: 'σούζα',
  map: 'χάρτης',
  shoot: 'βολή',
  'get down': 'σκύψε',
  walk: 'περπάτημα',
  'keep low': 'μείνε χαμηλά',
  torch: 'δάδα',
  'give up': 'τα παρατάω',
  helm: 'πηδάλιο',
  'pull back to stop alongside':
    'τράβα πίσω για να σταματήσεις δίπλα στη σχεδία',
  throttle: 'γκάζι',
  chart: 'χάρτης',
  'put in': 'επιστροφή',

  /* The lighthouse, once it turns out to be a ship. */
  Orbit: 'Τροχιά',
  'In orbit': 'Σε τροχιά',
  'You made it off the island': 'Τα κατάφερες, έφυγες από το νησί!',
  'Put your name on it': 'Γράψε το όνομά σου',
  'your name here': 'το όνομά σου εδώ',
  'Take your certificate': 'Πάρε το πιστοποιητικό σου',
  'Saved — take another': 'Αποθηκεύτηκε — θες κι άλλο;',
  'And the full CV': 'Και το πλήρες βιογραφικό',
  'Preview of your certificate': 'Έτσι θα είναι το πιστοποιητικό σου',
  'Add to your LinkedIn profile': 'Πρόσθεσέ το στο προφίλ σου στο LinkedIn',
  'Share the island on LinkedIn': 'Μοιράσου το νησί στο LinkedIn',
  'Every island game won. All six stickers are on it.':
    'Κέρδισες όλα τα παιχνίδια του νησιού. Και τα έξι αυτοκόλλητα είναι πάνω του.',
  'No stickers on this one — the island games are still down there.':
    'Αυτό δεν έχει αυτοκόλλητα — τα παιχνίδια του νησιού σε περιμένουν ακόμα εκεί κάτω.',
  '{count} / {total} island games won, and on the certificate.':
    '{count} / {total} παιχνίδια του νησιού κερδισμένα, και στο πιστοποιητικό.',
  'Signed by <b>{name}</b>.': 'Υπογράφει ο <b>{name}</b>.',
  'Thanks for walking the whole of it.': 'Ευχαριστώ που το γύρισες ολόκληρο.',
  'Fly back down to the island': 'Πέτα πίσω στο νησί',
  'Certificate saved. The shirt comes with the landing.':
    'Το πιστοποιητικό αποθηκεύτηκε. Η μπλούζα σε περιμένει στην προσγείωση.',
  'You can take the certificate down with you either way.':
    'Όπως και να ’χει, το πιστοποιητικό έρχεται μαζί σου.',
  'to launch': 'για εκτόξευση',
  'Hold. Strapped in and counting.':
    'Αναμονή. Δεμένος στη θέση σου, η αντίστροφη μέτρηση τρέχει.',
  'Ignition. The gantry has let go.': 'Ανάφλεξη. Το ικρίωμα σε άφησε.',
  'Climbing. The island is getting smaller.': 'Ανεβαίνεις. Το νησί μικραίνει.',
  'Orbit. Nothing out here but the hum.':
    'Τροχιά. Εδώ πάνω μόνο ένα απαλό βουητό.',
  LAUNCH: 'ΕΚΤΟΞΕΥΣΗ',
  'SUIT UP FIRST': 'ΠΡΩΤΑ Η ΣΤΟΛΗ',
  'ASTRO SUIT': 'ΔΙΑΣΤΗΜΙΚΗ ΣΤΟΛΗ',
  'SUIT ON': 'ΣΤΟΛΗ ΦΟΡΕΜΕΝΗ',
  'SUIT ON - GO': 'ΣΤΟΛΗ ΟΚ - ΠΑΜΕ',
  'KITSOS ISLAND · DEPARTURE': 'ΤΟ ΝΗΣΙ ΤΟΥ ΚΙΤΣΟΥ · ΑΝΑΧΩΡΗΣΗ',
  Credits: 'Συντελεστές',
  'Special thanks': 'Ιδιαίτερες ευχαριστίες',
  'To the love of my life, Amalia.': 'Στην αγάπη της ζωής μου, την Αμαλία.',
  'And to you, for walking the whole of it.':
    'Και σε σένα, που το γύρισες ολόκληρο.',
  'Played By': 'Στον πρωταγωνιστικό ρόλο',
  'Hang on...': 'Μια στιγμή...',
  'THIS IS NOT A LIGHTHOUSE': 'ΑΥΤΟ ΔΕΝ ΕΙΝΑΙ ΦΑΡΟΣ',
  'IT IS A SPACE ROCKET': 'ΕΙΝΑΙ ΔΙΑΣΤΗΜΙΚΟΣ ΠΥΡΑΥΛΟΣ',
  Cast: 'Πρωταγωνιστούν',
  Engineering: 'Τεχνικό τμήμα',
  'Art department': 'Καλλιτεχνικό τμήμα',
  Production: 'Παραγωγή',
  'Special effects': 'Ειδικά εφέ',
  Catering: 'Τροφοδοσία',
  'Written and built by': 'Σενάριο και κατασκευή',
  'To my family, for all of it.': 'Στην οικογένειά μου, για όλα.',
  /* The roll's jokes, in Greek rather than across from it. */
  'The island': 'Το νησί',
  'Played by itself': 'Ο εαυτός του',
  Townspeople: 'Οι κάτοικοι',
  'Seventy boxes in hats': 'Εβδομήντα κουτιά με καπέλα',
  'The sea': 'Η θάλασσα',
  'One sine wave, working hard': 'Ένα ημίτονο που δουλεύει σκληρά',
  'As itself, slowly': 'Ο εαυτός του, αργά',
  Everything: 'Τα πάντα',
  'Code review': 'Code review',
  'The same guy, next morning': 'Ο ίδιος τύπος, το επόμενο πρωί',
  Terrain: 'Έδαφος',
  'One function nobody dares touch':
    'Μια συνάρτηση που κανείς δεν τολμά να αγγίξει',
  Collision: 'Συγκρούσεις',
  'Mostly working': 'Δουλεύουν, συνήθως',
  Modelling: 'Μοντελοποίηση',
  Cubes: 'Κύβοι',
  Texturing: 'Υφές',
  No: 'Όχι',
  Lighting: 'Φωτισμός',
  'Turned up until it looked fine': 'Δυνάμωνε μέχρι να φαίνεται εντάξει',
  Soundtrack: 'Μουσική',
  'Written in JavaScript, regrettably': 'Γραμμένη σε JavaScript, δυστυχώς',
  'Quality Assurance': 'Έλεγχος ποιότητας',
  'A test suite with no sense of humour': 'Ένα σύνολο τεστ χωρίς ίχνος χιούμορ',
  'Bug triage': 'Διαλογή bugs',
  'Renaming them features': 'Τα μετονόμαζε σε features',
  'Scope control': 'Έλεγχος εύρους',
  'Abandoned early on': 'Εγκαταλείφθηκε νωρίς',
  Deadline: 'Προθεσμία',
  'Passed. Twice': 'Πέρασε. Δύο φορές',
  Rocket: 'Πύραυλος',
  'A lighthouse that lied to you': 'Ένας φάρος που σου είπε ψέματα',
  'Zero gravity': 'Μηδενική βαρύτητα',
  'Turning the gravity off': 'Κλείσαμε τη βαρύτητα',
  'Stunt double': 'Κασκαντέρ',
  'There was no budget': 'Δεν υπήρχε προϋπολογισμός',
  Explosions: 'Εκρήξεις',
  'Cut for being unrealistic': 'Κόπηκαν γιατί δεν ήταν ρεαλιστικές',
  'Christmas dinner': 'Χριστουγεννιάτικο τραπέζι',
  'The basement, once a year': 'Το υπόγειο, μία φορά τον χρόνο',
  'Everything else': 'Όλα τα άλλα',
  Coffee: 'Καφές',
  'DEPARTURE IN PROGRESS': 'ΑΝΑΧΩΡΗΣΗ ΣΕ ΕΞΕΛΙΞΗ',
  'THE OLD LIGHTHOUSE - CUTAWAY': 'Ο ΠΑΛΙΟΣ ΦΑΡΟΣ - ΤΟΜΗ',
  Shirt: 'Μπλούζα',
  Star: 'Αστέρι',
  Original: 'Αρχική',
  'MEET THE CHARACTERS': 'ΓΝΩΡΙΣΕ ΤΟΥΣ ΧΑΡΑΚΤΗΡΕΣ',
  Met: 'Γνωριστήκατε',
  'Met {met} of the {total} with a story to tell.':
    'Γνώρισες {met} από τους {total} που έχουν μια ιστορία να σου πουν.',
  'Out on the island': 'Έξω στο νησί',
  'At the thesis defence': 'Στην υποστήριξη της διπλωματικής',
  'Around the island': 'Σε όλο το νησί',
  'After dark': 'Μετά το σούρουπο',
  'Christmas Day only': 'Μόνο ανήμερα τα Χριστούγεννα',

  /* ---------------------------- The certificate ----------------------- */
  /*
   * Lettered for whoever reaches the end, man or woman, so the Greek never
   * leans on a gendered ending: «Βεβαιώνεται ότι» and a verb, never «ο/η».
   */
  'Certificate of Completion': 'Πιστοποιητικό Ολοκλήρωσης',
  'This certifies that': 'Βεβαιώνεται ότι',
  'walked every road of Kitsos Island, opened all five locks of the Old Lighthouse, and left the island under their own power aboard the ship inside it.':
    'περπάτησε κάθε δρόμο στο Νησί του Κίτσου, άνοιξε και τις πέντε κλειδαριές του Παλιού Φάρου και έφυγε από το νησί με το διαστημόπλοιο που έκρυβε μέσα του.',
  'Date of departure': 'Ημερομηνία αναχώρησης',
  'Keeper of the island': 'Ο φύλακας του νησιού',
  'Verify at kitsorfan.com/verify': 'Επαλήθευση στο kitsorfan.com/verify',
  Circuit: 'Πίστα',
  Balloon: 'Αερόστατο',
  Seeking: 'Κυνήγι',
  Hiding: 'Κρυψώνα',
}
