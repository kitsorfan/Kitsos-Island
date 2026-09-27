/**
 * Greek for the prompt at the bottom of the screen, and for what the things
 * it points at say back when you use them.
 *
 * The prompt is keyed as one phrase, verb and thing together, with the thing
 * in <b>…</b>: 'Talk to <b>Mayor Vasilis</b>'. Greek bends the name to fit
 * the verb — you talk to τον Δήμαρχο Βασίλη, go into το Σπίτι, read την
 * πινακίδα — and a verb set down in front of a name that has not bent for it
 * reads like a machine talking. A thing whose phrase is missing here shows
 * its name on its own, which is terse but never wrong.
 *
 * The verbs are the ones a Greek would use out loud: «Κοίτα» rather than
 * «Εξέτασε», «Μίλα με» rather than «Συνομίλησε».
 */
export const PROMPTS: Record<string, string> = {
  /* -------------------------------- People ---------------------------- */
  'Talk to <b>Mayor Vasilis</b>': 'Μίλα με τον <b>Δήμαρχο Βασίλη</b>',
  'Talk to <b>Eleni</b>': 'Μίλα με την <b>Ελένη</b>',
  'Talk to <b>Kostas</b>': 'Μίλα με τον <b>Κώστα</b>',
  'Talk to <b>Marios</b>': 'Μίλα με τον <b>Μάριο</b>',
  'Talk to <b>Grigoris</b>': 'Μίλα με τον <b>Γρηγόρη</b>',
  'Talk to <b>Thanasis</b>': 'Μίλα με τον <b>Θανάση</b>',
  'Talk to <b>Despina</b>': 'Μίλα με τη <b>Δέσποινα</b>',
  'Talk to <b>Nikos</b>': 'Μίλα με τον <b>Νίκο</b>',
  'Talk to <b>Captain Yannis</b>': 'Μίλα με τον <b>Καπετάν Γιάννη</b>',
  'Talk to <b>Ms. Stella</b>': 'Μίλα με την <b>κυρία Στέλλα</b>',
  'Talk to <b>Marina</b>': 'Μίλα με τη <b>Μαρίνα</b>',
  'Talk to <b>Alex</b>': 'Μίλα με τον <b>Άλεξ</b>',
  'Talk to <b>Sergeant Petros</b>': 'Μίλα με τον <b>λοχία Πέτρο</b>',
  'Talk to <b>Stelios</b>': 'Μίλα με τον <b>Στέλιο</b>',
  'Talk to <b>Sergeant Manolis</b>': 'Μίλα με τον <b>λοχία Μανώλη</b>',
  'Talk to <b>Private Fotis</b>': 'Μίλα με τον <b>στρατιώτη Φώτη</b>',
  'Talk to <b>Angelica</b>': 'Μίλα με την <b>Αντζέλικα</b>',
  'Talk to <b>Amalia</b>': 'Μίλα με την <b>Αμαλία</b>',
  'Talk to <b>Father</b>': 'Μίλα με τον <b>πατέρα σου</b>',
  'Talk to <b>Mother</b>': 'Μίλα με τη <b>μητέρα σου</b>',
  'Talk to <b>Kostis</b>': 'Μίλα με τον <b>Κωστή</b>',
  'Talk to <b>Rafail</b>': 'Μίλα με τον <b>Ραφαήλ</b>',
  'Talk to <b>Alexis</b>': 'Μίλα με τον <b>Αλέξη</b>',
  'Talk to <b>Alexandra</b>': 'Μίλα με την <b>Αλεξάνδρα</b>',
  'Talk to <b>Father-in-law</b>': 'Μίλα με τον <b>πεθερό σου</b>',
  'Talk to <b>Mother-in-law</b>': 'Μίλα με την <b>πεθερά σου</b>',
  'Talk to <b>Dean Tsanakas</b>': 'Μίλα με τον <b>Κοσμήτορα Τσανάκα</b>',
  'Talk to <b>Dr. Fotini</b>': 'Μίλα με τη <b>Δρ. Φωτεινή</b>',
  'Talk to <b>Prof. Nikos</b>': 'Μίλα με τον <b>καθηγητή Νίκο</b>',
  'Talk to <b>Giorgos</b>': 'Μίλα με τον <b>Γιώργο</b>',
  'Talk to <b>Prof. Ilias</b>': 'Μίλα με τον <b>καθηγητή Ηλία</b>',
  'Talk to <b>Robin</b>': 'Μίλα με τη <b>Ρόμπιν</b>',
  'Talk to <b>Kyriakos Oikonomou</b>': 'Μίλα με τον <b>Κυριάκο Οικονόμου</b>',
  'Talk to <b>Ms. Ioanna Panagopoulou</b>':
    'Μίλα με την <b>κυρία Ιωάννα Παναγοπούλου</b>',
  'Talk to <b>Klaus</b>': 'Μίλα με τον <b>Κλάους</b>',
  'Talk to <b>Prof. Dimitris Bertsimas</b>':
    'Μίλα με τον <b>καθηγητή Δημήτρη Μπερτσιμά</b>',
  'Talk to <b>Karim</b>': 'Μίλα με τον <b>Καρίμ</b>',
  'Talk to <b>Michalis</b>': 'Μίλα με τον <b>Μιχάλη</b>',
  'Talk to <b>Josh</b>': 'Μίλα με τον <b>Τζος</b>',
  'Talk to <b>Private Giotampas</b>': 'Μίλα με τον <b>στρατιώτη Γιωταμπά</b>',
  'Talk to <b>Lt Col Mitsidis</b>':
    'Μίλα με τον <b>Αντισυνταγματάρχη Μητσίδη</b>',
  'Talk to <b>2nd Lt Stavros</b>': 'Μίλα με τον <b>ανθυπολοχαγό Σταύρο</b>',
  'Talk to <b>Ms. Maria</b>': 'Μίλα με την <b>κυρία Μαρία</b>',
  'Talk to <b>Principal Nikos</b>': 'Μίλα με τον <b>διευθυντή Νίκο</b>',
  'Talk to <b>Mr. Diamantis</b>': 'Μίλα με τον <b>κύριο Διαμαντή</b>',
  'Talk to <b>Ms. Stavroula</b>': 'Μίλα με την <b>κυρία Σταυρούλα</b>',
  'Talk to <b>Sotiris</b>': 'Μίλα με τον <b>Σωτήρη</b>',
  'Talk to <b>Ms. Dimitra</b>': 'Μίλα με την <b>κυρία Δήμητρα</b>',
  'Talk to <b>Mr. Nikos</b>': 'Μίλα με τον <b>κύριο Νίκο</b>',
  'Talk to <b>Mr. Panagiotis</b>': 'Μίλα με τον <b>κύριο Παναγιώτη</b>',
  'Talk to <b>Sofia</b>': 'Μίλα με τη <b>Σοφία</b>',
  'Talk to <b>Dimitris</b>': 'Μίλα με τον <b>Δημήτρη</b>',
  'Talk to <b>Katerina</b>': 'Μίλα με την <b>Κατερίνα</b>',
  'Talk to <b>Maria</b>': 'Μίλα με τη <b>Μαρία</b>',

  /* ------------------------------- Buildings -------------------------- */
  'Enter <b>Kitsos House</b>': 'Μπες στο <b>Σπίτι του Κίτσου</b>',
  'Enter <b>National Technical University of Athens</b>':
    'Μπες στο <b>Εθνικό Μετσόβιο Πολυτεχνείο</b>',
  'Enter <b>Work District</b>': 'Μπες στη <b>Συνοικία Εργασίας</b>',
  'Enter <b>Army Camp</b>': 'Μπες στο <b>Στρατόπεδο</b>',
  'Enter <b>Town School</b>': 'Μπες στο <b>Σχολείο της Πόλης</b>',
  'Enter <b>Radio Center</b>': 'Μπες στο <b>Ραδιοφωνικό Κέντρο</b>',
  'Enter <b>The Old Lighthouse</b>': 'Μπες στον <b>Παλιό Φάρο</b>',
  'Unlock <b>The Old Lighthouse</b>': 'Ξεκλείδωσε τον <b>Παλιό Φάρο</b>',

  /* ----------------------- In the square and on the roads ------------- */
  'Read <b>Games Board</b>': 'Δες τα <b>Παιχνίδια του Νησιού</b>',
  'Press <b>The Big Red Button</b>': 'Πάτα το <b>Μεγάλο Κόκκινο Κουμπί</b>',
  'Read <b>Town Plaza</b>': 'Διάβασε την πινακίδα <b>Κεντρική Πλατεία</b>',
  'Read <b>Inspiration Road</b>': 'Διάβασε την πινακίδα <b>Οδός Έμπνευσης</b>',
  'Read <b>Discipline Road</b>': 'Διάβασε την πινακίδα <b>Οδός Πειθαρχίας</b>',
  'Read <b>Curiosity Road</b>': 'Διάβασε την πινακίδα <b>Οδός Περιέργειας</b>',
  'Read <b>Freedom Road</b>': 'Διάβασε την πινακίδα <b>Οδός Ελευθερίας</b>',
  'Read <b>Collaboration Road</b>':
    'Διάβασε την πινακίδα <b>Οδός Συνεργασίας</b>',
  'Read <b>Caring Road</b>': 'Διάβασε την πινακίδα <b>Οδός Φροντίδας</b>',
  'Read <b>Leadership Road</b>': 'Διάβασε την πινακίδα <b>Οδός Ηγεσίας</b>',
  'Read <b>Volunteers’ Kiosk</b>':
    'Διάβασε τον πίνακα στο <b>Περίπτερο των Εθελοντών</b>',

  /* --------------------------- Kit, bells and buttons ----------------- */
  'the pressure suit': 'η αστροστολή',
  'Put on <b>the pressure suit</b>': 'Φόρεσε την <b>αστροστολή</b>',
  'Hang up <b>the pressure suit</b>': 'Κρέμασε την <b>αστροστολή</b>',
  'the launch button': 'το κουμπί εκτόξευσης',
  'Press <b>the launch button</b>': 'Πάτα το <b>κουμπί εκτόξευσης</b>',
  'Put on <b>the officer’s uniform</b>':
    'Φόρεσε τη <b>στολή του αξιωματικού</b>',
  'Take off <b>the officer’s uniform</b>':
    'Βγάλε τη <b>στολή του αξιωματικού</b>',
  'Ring <b>the duty bell</b>': 'Χτύπα το <b>καμπανάκι υπηρεσίας</b>',

  /* ------------------------------ Kitsos House ------------------------ */
  'Examine <b>the trainer card</b>': 'Κοίτα την <b>κάρτα του εκπαιδευτή</b>',
  'Search <b>the shelf by the chessboard</b>':
    'Ψάξε στο <b>ράφι δίπλα στη σκακιέρα</b>',
  'Examine <b>the photographs</b>': 'Κοίτα τις <b>φωτογραφίες</b>',
  'Check <b>the calendar</b>': 'Κοίτα το <b>ημερολόγιο</b>',
  'Examine <b>the workbench</b>': 'Κοίτα τον <b>πάγκο εργασίας</b>',
  'Examine <b>the server</b>': 'Κοίτα τον <b>σέρβερ</b>',
  'Examine <b>the bookshelf</b>': 'Κοίτα τη <b>βιβλιοθήκη</b>',
  'Look at <b>the shelf of toys</b>': 'Κοίτα το <b>ράφι με τα παιχνίδια</b>',
  'Examine <b>the Verne shelf</b>': 'Κοίτα το <b>ράφι του Βερν</b>',
  'Try <b>the door at the end of the landing</b>':
    'Δοκίμασε την <b>πόρτα στο βάθος του πλατύσκαλου</b>',
  'Examine <b>the console under the television</b>':
    'Κοίτα την <b>κονσόλα κάτω από την τηλεόραση</b>',

  /* ----------------------------- The Polytechnic ---------------------- */
  'Examine <b>the degree notice</b>':
    'Διάβασε την <b>ανακοίνωση του διπλώματος</b>',
  'Examine <b>the thesis display</b>':
    'Κοίτα την <b>προθήκη της διπλωματικής</b>',
  'Examine <b>the publication case</b>':
    'Κοίτα την <b>προθήκη της δημοσίευσης</b>',
  'Examine <b>the certificate wall</b>':
    'Κοίτα τον <b>τοίχο με τα πιστοποιητικά</b>',
  'Examine <b>the letters of reference</b>':
    'Διάβασε τις <b>συστατικές επιστολές</b>',
  'Search <b>the thesis display shelf</b>':
    'Ψάξε στο <b>ράφι της προθήκης της διπλωματικής</b>',
  'Examine <b>the transcript</b>': 'Διάβασε την <b>αναλυτική βαθμολογία</b>',
  'Examine <b>the Survival Guide</b>': 'Ξεφύλλισε τον <b>Οδηγό Επιβίωσης</b>',
  'Examine <b>the petition</b>': 'Διάβασε το <b>ψήφισμα</b>',

  /* ------------------------------ Work District ----------------------- */
  'Examine <b>the building directory</b>':
    'Κοίτα τον <b>πίνακα του κτιρίου</b>',
  'Examine <b>the capabilities board</b>':
    'Κοίτα τον <b>πίνακα των ικανοτήτων</b>',
  'Examine <b>the skills terminal</b>':
    'Κοίτα το <b>τερματικό των δεξιοτήτων</b>',
  'Examine <b>the certification wall</b>':
    'Κοίτα τον <b>τοίχο των πιστοποιήσεων</b>',
  'Examine <b>the board of student jobs</b>':
    'Κοίτα τον <b>πίνακα με τις φοιτητικές δουλειές</b>',
  'Examine <b>the letter beside the board</b>':
    'Διάβασε την <b>επιστολή δίπλα στον πίνακα</b>',
  'Examine <b>the IBM pinboard</b>':
    'Κοίτα τον <b>πίνακα ανακοινώσεων της IBM</b>',
  'Search <b>the server rack</b>': 'Ψάξε στο <b>rack των σέρβερ</b>',
  'Examine <b>the team board</b>': 'Κοίτα τον <b>πίνακα της ομάδας</b>',
  'Examine <b>the platform terminal</b>':
    'Κοίτα το <b>τερματικό της πλατφόρμας</b>',
  'Examine <b>the technology wall</b>':
    'Κοίτα τον <b>τοίχο των τεχνολογιών</b>',

  /* -------------------------------- Army camp ------------------------- */
  'Examine <b>the service record</b>': 'Διάβασε το <b>φύλλο μητρώου</b>',
  'Search <b>the footlocker at the end of the bunks</b>':
    'Ψάξε στο <b>ερμάριο στο τέλος των κρεβατιών</b>',
  'Try <b>the door to the operations room</b>':
    'Δοκίμασε την <b>πόρτα της αίθουσας επιχειρήσεων</b>',
  'Examine <b>the commander’s letter</b>':
    'Διάβασε την <b>επιστολή του διοικητή</b>',

  /* --------------------------------- School --------------------------- */
  'Examine <b>the trophy case</b>': 'Κοίτα την <b>προθήκη των επάθλων</b>',
  'Examine <b>the volunteering case</b>':
    'Κοίτα την <b>προθήκη του εθελοντισμού</b>',
  'Search <b>the trophy case shelf</b>':
    'Ψάξε στο <b>ράφι της προθήκης των επάθλων</b>',
  'Examine <b>the honours board</b>': 'Κοίτα τον <b>πίνακα των διακρίσεων</b>',
  'Examine <b>the Pascal machine</b>': 'Κοίτα το <b>μηχάνημα της Pascal</b>',
  'Examine <b>the globe</b>': 'Γύρνα την <b>υδρόγειο</b>',
  'Examine <b>the scholarship letters</b>':
    'Διάβασε τις <b>επιστολές για την υποτροφία</b>',

  /* --------------------------- Radio and lighthouse ------------------- */
  'Examine <b>the transmitter</b>': 'Κοίτα τον <b>πομπό</b>',
  'Examine <b>the release notes</b>': 'Διάβασε τις <b>σημειώσεις έκδοσης</b>',
  'Examine <b>the keeper’s logbook</b>':
    'Διάβασε το <b>ημερολόγιο του φαροφύλακα</b>',
  'Examine <b>the crew screen</b>': 'Κοίτα την <b>οθόνη του πληρώματος</b>',
  'Examine <b>the departure notice</b>':
    'Διάβασε την <b>ανακοίνωση αναχώρησης</b>',

  /* ---------------------------- The lighthouse door -------------------- */
  'Closed for the night': 'Κλειστό για απόψε',
  Locked: 'Κλειδωμένο',
  'Five heavy locks, one for each district. {have} of {total} keys turned.':
    'Πέντε βαριές κλειδαριές, μία για κάθε συνοικία. Έχουν γυρίσει {have} από τα {total} κλειδιά.',
  'Every district building hides one. Ask the people who work there.':
    'Κάθε κτίριο συνοικίας κρύβει ένα. Ρώτα όσους δουλεύουν εκεί.',
  Unlocked: 'Ξεκλείδωτο',
  'All five locks turn at once. The door gives with a long, dry groan.':
    'Γυρίζουν και οι πέντε κλειδαριές μαζί. Η πόρτα υποχωρεί με ένα μακρύ, ξερό τρίξιμο.',
  'Unlocked. Press again at the door to go in.':
    'Ξεκλείδωσε! Πάτα ξανά στην πόρτα για να μπεις.',

  /* ---------------------------- The Big Red Button -------------------- */
  'Dead in daylight': 'Νεκρό όσο έχει φως',
  'The dome lights, hums, and does nothing at all.':
    'Ο θόλος ανάβει, βουίζει, και δεν κάνει απολύτως τίποτα.',
  'A plate under it reads: AFTER DARK ONLY. Come back when the lamps are on.':
    'Ένα ταμπελάκι από κάτω γράφει: ΜΟΝΟ ΜΕΤΑ ΤΟ ΣΟΥΡΟΥΠΟ. Έλα ξανά όταν ανάψουν τα φώτα.',
  'Not in the middle of a game': 'Όχι στη μέση του παιχνιδιού',
  'Press it now and the whole island walks into the square to dance, which rather gives the game away.':
    'Αν το πατήσεις τώρα, όλο το νησί θα κατέβει στην πλατεία να χορέψει, και τότε τι κρυφτό να παίξεις;',
  'Finish the hide and seek first.': 'Τελείωσε πρώτα το κρυφτό.',

  /* ------------------------------ The key spots ----------------------- */
  Empty: 'Άδειο',
  'You already took the key from here.':
    'Το κλειδί από εδώ το έχεις ήδη πάρει.',
  'Key found': 'Βρήκες κλειδί',
  'You lift the brass key from the shelf by the chessboard.':
    'Παίρνεις το μπρούτζινο κλειδί από το ράφι δίπλα στη σκακιέρα.',
  'You lift the lecture hall key from the thesis display shelf.':
    'Παίρνεις το κλειδί του αμφιθεάτρου από το ράφι της προθήκης της διπλωματικής.',
  'You lift the server room key from the server rack.':
    'Παίρνεις το κλειδί της μηχανογράφησης από το rack των σέρβερ.',
  'You lift the footlocker key from the footlocker at the end of the bunks.':
    'Παίρνεις το κλειδί του ερμαρίου από το ερμάριο στο τέλος των κρεβατιών.',
  'You lift the cabinet key from the trophy case shelf.':
    'Παίρνεις το κλειδί της ντουλάπας από το ράφι της προθήκης των επάθλων.',
  '{count} of 5 locks on the Old Lighthouse can turn now.':
    'Τώρα μπορούν να γυρίσουν {count} από τις 5 κλειδαριές του Παλιού Φάρου.',
  'It does not open.': 'Δεν ανοίγει.',
}
