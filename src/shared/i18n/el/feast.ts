/**
 * Greek for the calendar on the basement wall and the day it hides.
 *
 * The months are in the genitive — 8 Απριλίου, not 8 Απρίλιος — because that
 * is what Greek does when a day is in front of a month, and it is also what a
 * Greek calendar prints on its own face, so one form covers both.
 *
 * 'Chronia polla' in the English is the Greek said out loud; here it simply
 * goes back to being Greek. The register is the one the day actually has:
 * everybody talking at once, and nobody saying anything they would write down.
 */
export const FEAST: Record<string, string> = {
  /* -------------------------------- months ---------------------------- */
  January: 'Ιανουαρίου',
  February: 'Φεβρουαρίου',
  March: 'Μαρτίου',
  April: 'Απριλίου',
  May: 'Μαΐου',
  June: 'Ιουνίου',
  July: 'Ιουλίου',
  August: 'Αυγούστου',
  September: 'Σεπτεμβρίου',
  October: 'Οκτωβρίου',
  November: 'Νοεμβρίου',
  December: 'Δεκεμβρίου',
  Jan: 'Ιαν',
  Feb: 'Φεβ',
  Mar: 'Μαρ',
  Apr: 'Απρ',
  Jun: 'Ιουν',
  Jul: 'Ιουλ',
  Aug: 'Αυγ',
  Sep: 'Σεπ',
  Oct: 'Οκτ',
  Nov: 'Νοε',
  Dec: 'Δεκ',

  /* ------------------------------ the calendar ------------------------ */
  'the calendar': 'το ημερολόγιο',
  Check: 'Κοίτα',
  'The calendar': 'Το ημερολόγιο',
  /* Whose day it is. His nameday rather than his birthday on the twenty-fifth
     — in Greek those are two different words and only one of them is right. */
  'Kitsos’ birthday': 'Τα γενέθλια του Κίτσου',
  'Amalia’s birthday': 'Τα γενέθλια της Αμαλίας',
  'Christmas Day': 'Χριστούγεννα',
  'Merry Christmas': 'Καλά Χριστούγεννα',
  'The basement wall': 'Ο τοίχος του υπογείου',
  Month: 'Μήνας',
  'Hang it back up': 'Κρέμασέ το πίσω',
  'Everyone is downstairs. Both families, the tree, and the meal he has hosted every year of his life.':
    'Είναι όλοι κάτω. Και οι δύο οικογένειες, το δέντρο, και το τραπέζι που φιλοξενεί κάθε χρόνο της ζωής του.',
  'Christmas in the basement': 'Χριστούγεννα στο υπόγειο',
  'Turn the calendar to the twenty-fifth of December and the basement is dressed, the tree is up and both families are round the table. It is his nameday as well as Christmas, and the meal has always been hosted here.':
    'Γύρνα το ημερολόγιο στις είκοσι πέντε Δεκεμβρίου και το υπόγειο είναι στολισμένο, το δέντρο στημένο και οι δύο οικογένειες γύρω από το τραπέζι. Είναι η γιορτή του όσο και Χριστούγεννα, και το τραπέζι γινόταν πάντα εδώ.',

  /* ------------------------- round the table, his side ---------------- */
  'Sit, sit. Everyone is here, both sides of the table, and the food is going cold while I talk.':
    'Κάτσε, κάτσε. Είναι όλοι εδώ, και οι δύο πλευρές του τραπεζιού, και το φαγητό κρυώνει όσο μιλάω.',
  'Christmas and your nameday on the same day. Your mother and I did not plan that, and we have never once complained about it.':
    'Χριστούγεννα και η γιορτή σου την ίδια μέρα. Με τη μητέρα σου δεν το σχεδιάσαμε, και ούτε μια φορά δεν παραπονεθήκαμε.',
  'Ten of us, and I have counted the plates three times. Sit down before I count them again.':
    'Δέκα είμαστε, και μέτρησα τα πιάτα τρεις φορές. Κάτσε κάτω πριν τα μετρήσω πάλι.',
  'Every year in this basement, since before any of you were tall enough to carry a dish.':
    'Κάθε χρόνο σε αυτό το υπόγειο, από πριν φτάσει κανείς σας σε ύψος να κρατήσει πιατέλα.',
  'The lights on that tree are on a timer I built. If they go out, say nothing.':
    'Τα λαμπάκια σε αυτό το δέντρο είναι πάνω σε χρονοδιακόπτη που έφτιαξα εγώ. Αν σβήσουν, μην πεις τίποτα.',
  'Chronia polla. Both of them on the same day. You always did like doing two things at once.':
    'Χρόνια πολλά. Και τα δύο την ίδια μέρα. Πάντα σου άρεσε να κάνεις δύο πράγματα μαζί.',
  'We are playing in the street after we eat. You are on my side, and no arguing about the score this year.':
    'Μετά το φαγητό παίζουμε στον δρόμο. Είσαι στην ομάδα μου, και φέτος δεν τσακωνόμαστε για το σκορ.',
  'Chronia polla, brother. Eat something before you start explaining what you are working on.':
    'Χρόνια πολλά, αδελφέ. Φάε κάτι πριν αρχίσεις να εξηγείς τι φτιάχνεις.',
  'Chronia polla. Enjoy every course of it, and then come and see me in January like everybody else.':
    'Χρόνια πολλά. Απόλαυσε κάθε πιάτο, και μετά έλα να με δεις τον Ιανουάριο όπως όλοι.',
  'Two families in one basement and not one raised voice yet. Give it an hour.':
    'Δύο οικογένειες σε ένα υπόγειο και ακόμη καμία υψωμένη φωνή. Δώσ’ του μια ώρα.',
  'Chronia polla! I put you next to me, and I do not care what the plates say.':
    'Χρόνια πολλά! Σε έβαλα δίπλα μου, και δεν με νοιάζει τι λένε τα πιάτα.',
  'This is the one day I stop being the youngest of five and go back to being the youngest of everybody.':
    'Είναι η μόνη μέρα που παύω να είμαι η μικρότερη από πέντε και ξαναγίνομαι η μικρότερη από όλους.',
  'Chronia polla, my love. Your nameday, and both our families in one room for it.':
    'Χρόνια πολλά, αγάπη μου. Η γιορτή σου, και οι δύο οικογένειές μας σε ένα δωμάτιο για αυτήν.',
  'My mother and father are here, and my sister. Go on. They have been waiting all year to see you.':
    'Η μητέρα και ο πατέρας μου είναι εδώ, και η αδελφή μου. Πήγαινε. Σε περιμένουν όλη τη χρονιά.',
  'This is the happiest day of the year in this house. It is the same every year, and I would not change a thing about it.':
    'Είναι η πιο χαρούμενη μέρα του χρόνου σε αυτό το σπίτι. Είναι η ίδια κάθε χρόνο, και δεν θα άλλαζα τίποτα σε αυτήν.',

  /* ------------------------- round the table, her side ---------------- */
  'Father-in-law': 'Πεθερός',
  Physicist: 'Φυσικός',
  'Her father, at the table': 'Ο πατέρας της, στο τραπέζι',
  'Amalia’s father, a physicist. In the house for the Christmas meal, and pleased to have somebody to argue about first principles with.':
    'Ο πατέρας της Αμαλίας, φυσικός. Στο σπίτι για το χριστουγεννιάτικο τραπέζι, και ευχαριστημένος που έχει κάποιον να διαφωνεί μαζί του για τις πρώτες αρχές.',
  'A physicist and an engineer at the same table. We agree on more than either of us lets on.':
    'Ένας φυσικός και ένας μηχανικός στο ίδιο τραπέζι. Συμφωνούμε σε περισσότερα από όσα δείχνουμε.',
  'You explain your work the way somebody explains it who actually understands it. That is rarer than you think.':
    'Εξηγείς τη δουλειά σου όπως την εξηγεί κάποιος που την καταλαβαίνει πραγματικά. Αυτό είναι πιο σπάνιο από όσο νομίζεις.',
  'Chronia polla. And well done on the island. I looked at the whole thing twice.':
    'Χρόνια πολλά. Και μπράβο για το νησί. Το κοίταξα όλο δύο φορές.',

  'Mother-in-law': 'Πεθερά',
  'English teacher': 'Καθηγήτρια αγγλικών',
  'Her mother, at the table': 'Η μητέρα της, στο τραπέζι',
  'Amalia’s mother, an English teacher. Thirty years of it, and she has read every word on this island twice.':
    'Η μητέρα της Αμαλίας, καθηγήτρια αγγλικών. Τριάντα χρόνια, και έχει διαβάσει κάθε λέξη σε αυτό το νησί δύο φορές.',
  'I taught English for thirty years, so you will forgive me for reading every word on this island twice.':
    'Δίδαξα αγγλικά τριάντα χρόνια, οπότε συγχώρεσέ με που διάβασα κάθε λέξη σε αυτό το νησί δύο φορές.',
  'You write the way you talk, which is the hardest thing to teach anybody.':
    'Γράφεις όπως μιλάς, που είναι το πιο δύσκολο πράγμα να διδάξεις σε κάποιον.',
  'Chronia polla. Sit down and eat, and we can talk about the rest of it afterwards.':
    'Χρόνια πολλά. Κάτσε να φας, και για τα υπόλοιπα θα μιλήσουμε μετά.',

  Angelica: 'Αντζέλικα',
  /* Her role and journal moved out to the island with her — see el/world.ts.
     What stays here is what she says at the table on the day. */
  'I am an architect, so I have opinions about your island. The lighthouse is right. The plaza wants one more tree.':
    'Είμαι αρχιτέκτονας, οπότε έχω άποψη για το νησί σου. Ο φάρος είναι σωστός. Η πλατεία θέλει ένα δέντρο ακόμη.',
  'You and Kostis build. I draw first and then argue with whoever has to build it. Same family of problem.':
    'Εσύ και ο Κωστής χτίζετε. Εγώ πρώτα σχεδιάζω και μετά τσακώνομαι με όποιον πρέπει να το χτίσει. Ίδια οικογένεια προβλημάτων.',
  'Chronia polla! And happy Christmas, in that order, since the nameday is the one people forget.':
    'Χρόνια πολλά! Και καλά Χριστούγεννα, με αυτή τη σειρά, γιατί τη γιορτή είναι που ξεχνάει ο κόσμος.',
}
