// Initial seed data for local-first mode. Hooks hydrate from localStorage if
// present, otherwise fall back to these.

export const SEED_EVENTS = [
  { id: 1, title: 'David finals',     date: '2026-05-14', who: ['David'],                              dot: '#D85A30' },
  { id: 2, title: 'LLC board call',   date: '2026-05-16', who: ['Dave', 'Krista'],                     dot: '#BA7517' },
  { id: 3, title: 'Kailee recital',   date: '2026-05-21', who: ['Kailee', 'Dave', 'Krista', 'David'],  dot: '#D4537E' },
  { id: 4, title: 'Krista dentist',   date: '2026-05-22', who: ['Krista'],                             dot: '#1D9E75' },
  { id: 5, title: 'BBQ weekend',      date: '2026-05-24', who: ['Dave', 'Krista', 'David', 'Kailee'],  dot: '#378ADD' },
  { id: 6, title: 'Graduation party', date: '2026-05-30', who: ['David', 'Dave', 'Krista', 'Kailee'],  dot: '#1D9E75' },
]

export const SEED_CHORES = [
  { id: 1, name: 'Wash dishes',         who: 'Kailee', pts: 5,  done: false },
  { id: 2, name: 'Take out trash',      who: 'David',  pts: 5,  done: true  },
  { id: 3, name: 'Vacuum living room',  who: 'Kailee', pts: 10, done: false },
  { id: 4, name: 'Mow lawn',            who: 'David',  pts: 15, done: true  },
  { id: 5, name: 'Clean bathrooms',     who: 'Krista', pts: 10, done: false },
  { id: 6, name: 'Laundry',             who: 'Dave',   pts: 10, done: true  },
  { id: 7, name: 'Wipe counters',       who: 'Kailee', pts: 5,  done: false },
]

export const SEED_MEALS = [
  { day: 'Mon', meal: 'Spaghetti bolognese',     cook: 'Dave'   },
  { day: 'Tue', meal: 'Taco Tuesday',            cook: 'Krista' },
  { day: 'Wed', meal: 'Grilled chicken + salad', cook: 'David'  },
  { day: 'Thu', meal: 'Takeout night',           cook: '—'      },
  { day: 'Fri', meal: 'Homemade pizza',          cook: 'Krista' },
  { day: 'Sat', meal: 'BBQ ribs',                cook: 'Dave'   },
  { day: 'Sun', meal: 'Leftover remix',          cook: 'Kailee' },
]

export const SEED_GROCERIES = [
  { id: 1, name: 'Ground beef (2 lbs)', cat: 'Meat',       done: false },
  { id: 2, name: 'Tortillas',           cat: 'Bread',      done: false },
  { id: 3, name: 'Shredded cheese',     cat: 'Dairy',      done: true  },
  { id: 4, name: 'Salsa',               cat: 'Condiments', done: false },
  { id: 5, name: 'Romaine lettuce',     cat: 'Produce',    done: true  },
  { id: 6, name: 'Pasta (16 oz)',       cat: 'Pantry',     done: false },
  { id: 7, name: 'Tomato sauce',        cat: 'Pantry',     done: false },
  { id: 8, name: 'Chicken breasts',     cat: 'Meat',       done: false },
]

// Tag colors are vibrant solids with white text — pops on the dark glass
// theme. Same palette is reused for the category filter buttons on the
// Explore page (when active).
export const SEED_ACTIVITIES = [
  { id: 1, title: 'Suisun Waterfront District',      meta: 'Daily · 10 min · Free',            tag: 'Free',         tagBg: '#D97706', tagTxt: '#FFFFFF', stars: 4, type: 'free'    },
  { id: 2, title: 'Jelly Belly Factory tour',        meta: 'Mon–Sat · 5 min · Free',           tag: 'Free',         tagBg: '#D97706', tagTxt: '#FFFFFF', stars: 4, type: 'free'    },
  { id: 3, title: 'Travis Heritage Center',          meta: 'Wed–Sat · 15 min · $10',           tag: 'Kid-friendly', tagBg: '#2563EB', tagTxt: '#FFFFFF', stars: 4, type: 'kids'    },
  { id: 4, title: 'Lagoon Valley Park hike',         meta: 'Any day · Vacaville · $5 parking', tag: 'Outdoor',      tagBg: '#16A34A', tagTxt: '#FFFFFF', stars: 4, type: 'outdoor' },
  { id: 5, title: 'Downtown Napa tasting',           meta: 'Fri–Sun · 30 min · $$',            tag: 'Food & drink', tagBg: '#E25822', tagTxt: '#FFFFFF', stars: 5, type: 'food'    },
  { id: 6, title: 'Lake Berryessa kayaking',         meta: 'Half day · 35 min · $35/kayak',    tag: 'Outdoor',      tagBg: '#16A34A', tagTxt: '#FFFFFF', stars: 5, type: 'outdoor' },
  { id: 7, title: 'Rockville Hills Regional Park',   meta: 'Any day · 8 min · Free',           tag: 'Outdoor',      tagBg: '#16A34A', tagTxt: '#FFFFFF', stars: 5, type: 'outdoor' },
  { id: 8, title: 'Downtown Vacaville restaurants',  meta: 'Evenings · 15 min · $$',           tag: 'Food & drink', tagBg: '#E25822', tagTxt: '#FFFFFF', stars: 4, type: 'food'    },
]

export const SEED_VOTES = [
  { id: 1, name: 'Safari West',              count: 2 },
  { id: 2, name: 'Kayak the Russian River',  count: 1 },
  { id: 3, name: 'Farmers market + brunch',  count: 3 },
  { id: 4, name: 'Redwoods hike',            count: 1 },
]

// bg is the icon-bubble background — semi-transparent vibrant tint that pops
// on the dark theme. Trips.jsx renders the icon in white on top.
export const SEED_TRIPS = [
  { id: 1, name: 'Lake Tahoe summer trip',  dates: 'Jul 18–22', budget: 1800, spent: 320, icon: 'Mountain', bg: 'rgba(37, 99, 235, 0.55)' },
  { id: 2, name: 'Disneyland fall break',   dates: 'Oct 10–13', budget: 3200, spent: 0,   icon: 'Castle',   bg: 'rgba(224, 72, 119, 0.55)' },
]

export const SEED_PHOTOS = [
  'Mountain', 'Flame', 'Umbrella', 'Snowflake', 'Dog', 'Camera', 'Trees', 'Smile',
]

// Birthdays + anniversaries. monthDay is "MM-DD" (recurring); year is optional
// — when set, we can show "turning N". group is 'family' for the four core
// members or 'extended' for everyone else. Edit these in the UI to your real
// dates — these are placeholders so the empty state isn't blank.
export const SEED_OCCASIONS = [
  { id: 1,  name: 'Dave',            type: 'birthday',    monthDay: '03-12', year: 1979, group: 'family',   relation: 'Dad'         },
  { id: 2,  name: 'Krista',          type: 'birthday',    monthDay: '07-04', year: 1981, group: 'family',   relation: 'Mom'         },
  { id: 3,  name: 'David',           type: 'birthday',    monthDay: '09-08', year: 2003, group: 'family',   relation: 'Son'         },
  { id: 4,  name: 'Kailee',          type: 'birthday',    monthDay: '12-19', year: 2005, group: 'family',   relation: 'Daughter'    },
  { id: 5,  name: 'Dave & Krista',   type: 'anniversary', monthDay: '06-22', year: 2007, group: 'family',   relation: 'Anniversary' },
  { id: 6,  name: 'Grandma Rose',    type: 'birthday',    monthDay: '04-30', year: 1952, group: 'extended', relation: 'Grandma'     },
  { id: 7,  name: 'Uncle Joe',       type: 'birthday',    monthDay: '11-15',             group: 'extended', relation: 'Uncle'       },
]

// Wishlist items. Each item is owned by one family member and shared with a
// subset of the others (`shareWith`). Owners never see the claim state of
// their own items — that keeps surprises intact. claimedBy tracks who's
// already grabbing it so siblings don't double-buy.
export const SEED_WISHLIST = [
  { id: 1, owner: 'Kailee', name: 'New running shoes (size 8)', url: '',  notes: 'Brooks Ghost in any color',     shareWith: ['Dave', 'Krista'],          claimedBy: null   },
  { id: 2, owner: 'Kailee', name: 'AirPods Pro',                url: '',  notes: '',                              shareWith: ['Dave', 'Krista', 'David'], claimedBy: null   },
  { id: 3, owner: 'David',  name: 'Steam gift card',            url: '',  notes: '$25 is plenty',                 shareWith: ['Dave', 'Krista', 'Kailee'], claimedBy: null  },
  { id: 4, owner: 'David',  name: 'Mechanical keyboard',        url: '',  notes: 'Tactile switches, TKL preferred', shareWith: ['Dave', 'Krista'],         claimedBy: 'Dave' },
  { id: 5, owner: 'Dave',   name: 'Pizza stone',                url: '',  notes: 'For the Blackstone',            shareWith: ['Krista'],                  claimedBy: null   },
  { id: 6, owner: 'Krista', name: 'Nice gardening gloves',      url: '',  notes: 'Womens medium',                 shareWith: ['Dave', 'David', 'Kailee'], claimedBy: null   },
]

// Document vault — metadata only for now. Real file uploads require Supabase
// Storage (or similar), which isn't wired up yet. The `link` field can point
// to where the file actually lives (cloud drive, scan service, etc.).
export const SEED_DOCUMENTS = [
  { id: 1, name: 'Geico auto insurance card',     category: 'Insurance', owner: 'Family', expiry: '2027-02-15', notes: '2-car policy',     link: '' },
  { id: 2, name: "Dave's passport",               category: 'ID',        owner: 'Dave',   expiry: '2031-08-04', notes: '',                  link: '' },
  { id: 3, name: '2022 Tesla title',              category: 'Vehicle',   owner: 'Family', expiry: null,         notes: 'Garage filing box', link: '' },
  { id: 4, name: 'House mortgage statement',      category: 'Financial', owner: 'Family', expiry: null,         notes: 'Wells Fargo',       link: '' },
  { id: 5, name: "Kailee's vaccination record",   category: 'Medical',   owner: 'Kailee', expiry: null,         notes: '',                  link: '' },
]

export const DOCUMENT_CATEGORIES = ['Insurance', 'ID', 'Vehicle', 'Medical', 'Financial', 'Legal', 'Other']

export const SEED_PACKAGES = [
  { id: 1, trackingNumber: '1Z999AA10123456784',     carrier: 'UPS',    description: 'Pizza stone',                 recipient: 'Dave',   status: 'in_transit', expectedDate: '2026-05-17' },
  { id: 2, trackingNumber: '9400111899560000000000', carrier: 'USPS',   description: 'Running shoes (Brooks Ghost)', recipient: 'Kailee', status: 'in_transit', expectedDate: '2026-05-18' },
  { id: 3, trackingNumber: 'TBA305432167890',         carrier: 'Amazon', description: 'Keyboard keycaps',            recipient: 'David',  status: 'delivered',  expectedDate: '2026-05-12' },
]

export const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Amazon', 'Other']

// "Ask the family" quick polls. One vote per member per poll; switching is
// allowed (re-voting just moves your name). Distinct from the simpler
// SEED_VOTES counter used on the Trips page weekend poll.
export const SEED_POLLS = [
  {
    id: 1,
    question: 'Pizza Friday — what are we doing?',
    options: [
      { id: 'a', text: 'Homemade on the Blackstone' },
      { id: 'b', text: 'Mary\'s Pizza Shack' },
      { id: 'c', text: 'Frozen + a movie' },
    ],
    votes: { Dave: 'a', Kailee: 'a', David: 'b' },
    askedBy: 'Krista',
    createdAt: '2026-05-13T18:00:00Z',
  },
  {
    id: 2,
    question: 'Sunday morning vibe?',
    options: [
      { id: 'a', text: 'Big family breakfast at home' },
      { id: 'b', text: 'Brunch out somewhere' },
      { id: 'c', text: 'Everyone on their own' },
    ],
    votes: { Dave: 'b' },
    askedBy: 'Dave',
    createdAt: '2026-05-14T07:30:00Z',
  },
]

export const SEED_MOVIES = [
  { id: 1, title: 'The Wild Robot', meta: '2024 · Animation · PG',    icon: 'Bot'      },
  { id: 2, title: 'Interstellar',   meta: '2014 · Sci-fi · PG-13',    icon: 'Orbit'    },
  { id: 3, title: 'Knives Out',     meta: '2019 · Mystery · PG-13',   icon: 'Search'   },
  { id: 4, title: 'Encanto',        meta: '2021 · Animation · PG',    icon: 'Sparkles' },
]
