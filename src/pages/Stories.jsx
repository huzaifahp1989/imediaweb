import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Headphones, X, Sparkles, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import InteractiveStoryPlayer from "@/components/stories/InteractiveStoryPlayer";
import { supabase } from "@/api/supabaseClient";
import { awardPointsForGame } from "@/api/points";

const authenticStories = [
  {
    id: "truthfulness",
    title: "Truthfulness Leads to Jannah",
    category: "manners",
    summary: "A boy chooses honesty even when it's hard, and is rewarded with trust and blessings.",
    ayah: {
      ref: "Quran 33:70-71",
      text: "O you who have believed, fear Allah and speak words of appropriate justice. He will [then] amend for you your deeds and forgive you your sins..."
    },
    hadith: {
      ref: "Sahih Bukhari & Muslim",
      text: "Truthfulness leads to righteousness, and righteousness leads to Paradise. A man keeps on telling the truth until he becomes a truthful person. Lying leads to wickedness, and wickedness leads to Hellfire."
    },
    moral: "Always tell the truth. Allah makes your path easy and your deeds accepted when you keep honesty."
  },
  {
    id: "mercy_to_animals",
    title: "Mercy to Animals",
    category: "kindness",
    summary: "A child cares for a hungry cat and learns that kindness brings Allah’s mercy.",
    ayah: {
      ref: "Quran 21:107",
      text: "And We have not sent you, [O Muhammad], except as a mercy to the worlds."
    },
    hadith: {
      ref: "Sahih Bukhari",
      text: "A woman was punished because she imprisoned a cat and did not feed it, nor let it free to eat the insects of the earth."
    },
    moral: "Show mercy to all of Allah’s creatures. Allah loves those who are merciful."
  },
  {
    id: "charity_extinguishes_sins",
    title: "Charity Extinguishes Sins",
    category: "gratitude",
    summary: "A family gives from what they love and sees their troubles eased by charity.",
    ayah: {
      ref: "Quran 2:261",
      text: "The example of those who spend their wealth in the way of Allah is like a seed [of grain] that sprouts seven ears; in every ear there are a hundred grains..."
    },
    hadith: {
      ref: "Jami' at-Tirmidhi",
      text: "Sadaqah extinguishes sins as water extinguishes fire."
    },
    moral: "Give generously for Allah’s sake. Charity purifies hearts and brings blessings."
  },
  {
    id: "patience_in_trials",
    title: "Patience in Trials",
    category: "manners",
    summary: "A child endures a difficult situation with sabr and finds relief from Allah.",
    ayah: {
      ref: "Quran 2:153",
      text: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient."
    },
    hadith: {
      ref: "Sahih Bukhari",
      text: "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that."
    },
    moral: "Sabr brings Allah’s nearness and wipes away sins."
  },
  {
    id: "honor_parents",
    title: "Honoring Parents",
    category: "manners",
    summary: "A boy obeys and cares for his parents, and Allah raises his status.",
    ayah: {
      ref: "Quran 17:23",
      text: "And your Lord has decreed that you not worship except Him, and to parents, good treatment..."
    },
    hadith: {
      ref: "Sahih Bukhari",
      text: "The pleasure of the Lord lies in the pleasure of the parents, and the anger of the Lord lies in the anger of the parents."
    },
    moral: "Be kind and dutiful to your parents to gain Allah’s pleasure."
  },
  {
    id: "justice_and_fairness",
    title: "Justice and Fairness",
    category: "honesty",
    summary: "Children learn to judge fairly between friends, following the Qur’an’s guidance.",
    ayah: {
      ref: "Quran 4:135",
      text: "O you who have believed, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves or parents and relatives..."
    },
    hadith: {
      ref: "Sahih Muslim",
      text: "Those who are just will be on thrones of light near Allah... those who are fair in their judgments and with their families."
    },
    moral: "Stand for justice even when it’s hard—Allah loves the fair and just."
  },
  {
    id: "forgiveness_and_mercy",
    title: "Forgiveness and Mercy",
    category: "kindness",
    summary: "A quarrel is healed through forgiveness, bringing unity and Allah’s mercy.",
    ayah: {
      ref: "Quran 24:22",
      text: "And let them pardon and overlook. Would you not like that Allah should forgive you?"
    },
    hadith: {
      ref: "Sahih Muslim",
      text: "Allah shows mercy to those who are merciful."
    },
    moral: "Forgive others to receive Allah’s forgiveness and mercy."
  },
  {
    id: "trust_in_allah",
    title: "Trust in Allah (Tawakkul)",
    category: "gratitude",
    summary: "A family places trust in Allah and sees their needs fulfilled.",
    ayah: {
      ref: "Quran 65:3",
      text: "And whoever relies upon Allah—then He is sufficient for him."
    },
    hadith: {
      ref: "Tirmidhi",
      text: "If you were to rely upon Allah with the required reliance, He would provide for you as He provides for the birds; they go out hungry and return with full bellies."
    },
    moral: "Put your trust in Allah in all matters—He is sufficient."
  }
];

const categories = [
  { id: "all", name: "All Stories", icon: "📚" },
  { id: "prophets", name: "Prophets", icon: "✨" },
  { id: "sahabah", name: "Companions", icon: "⚔️" },
  { id: "manners", name: "Good Manners", icon: "🌟" },
  { id: "kindness", name: "Kindness", icon: "💚" },
  { id: "honesty", name: "Honesty", icon: "🤝" },
  { id: "gratitude", name: "Gratitude", icon: "🙏" },
  { id: "bedtime", name: "Bedtime", icon: "🌙" }
];

export default function Stories() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStory, setSelectedStory] = useState(null);
  const [user, setUser] = useState(null);
  const [showMasjidStory, setShowMasjidStory] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(Array(10).fill(null));
  const [quizStatus, setQuizStatus] = useState("");
  const [showGuestStory, setShowGuestStory] = useState(false);
  const [guestQuizAnswers, setGuestQuizAnswers] = useState(Array(10).fill(null));
  const [guestQuizStatus, setGuestQuizStatus] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      return await base44.entities.Story.list('-created_date');
    },
    initialData: [],
  });

  const filteredStories = selectedCategory === "all"
    ? stories
    : stories.filter(story => story.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📖</div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="text-5xl md:text-6xl mb-4">📖</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Stories
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Read inspiring stories from Islamic history and learn valuable lessons
          </p>
        </motion.div>

        {/* Authentic Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Card className="shadow-xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Featured Authentic Stories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authenticStories.map((s) => (
                  <Card key={s.id} className="border hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge variant="outline" className="text-xs mb-2">
                        {categories.find(c => c.id === s.category)?.icon} {s.category}
                      </Badge>
                      <CardTitle className="text-lg">{s.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-700">{s.summary}</p>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r">
                        <div className="text-xs text-purple-700 font-semibold mb-1">Quran Ayah — {s.ayah.ref}</div>
                        <div className="text-sm text-gray-800">{s.ayah.text}</div>
                      </div>
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
                        <div className="text-xs text-amber-700 font-semibold mb-1">Hadith — {s.hadith.ref}</div>
                        <div className="text-sm text-gray-800">{s.hadith.text}</div>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                        <div className="text-xs text-blue-700 font-semibold mb-1">Moral</div>
                        <div className="text-sm text-gray-800">{s.moral}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Muhammad and Zaid Story with Quiz */}
              <Card className="mt-6 border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge variant="outline" className="text-xs mb-2">🌟 Etiquette</Badge>
                  <CardTitle className="text-lg">The Day the Masjid Smiled</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">A warm story of Muhammad and Zaid learning adab (Islamic manners) at the masjid — with a kids quiz at the end.</p>
                  <Button onClick={() => setShowMasjidStory(true)} className="bg-blue-600">Read & Take Quiz</Button>
                </CardContent>
              </Card>
              {/* Guest Etiquette Story with Quiz */}
              <Card className="mt-6 border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge variant="outline" className="text-xs mb-2">🌟 Etiquette</Badge>
                  <CardTitle className="text-lg">The Guest Who Taught Them Manners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">Muhammad and Zaid honor their guest and learn beautiful Sunnah about hosting — with a kids quiz at the end.</p>
                  <Button onClick={() => setShowGuestStory(true)} className="bg-blue-600">Read & Take Quiz</Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.id ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600">No stories available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                  <CardHeader className="p-0 relative">
                    {story.image_url && (
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-xl overflow-hidden">
                        <img
                          src={story.image_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {story.is_interactive && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Interactive
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === story.category)?.icon} {story.category}
                      </Badge>
                      {story.age_range && (
                        <Badge variant="outline" className="text-xs">
                          {story.age_range} years
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl mb-3 line-clamp-2">
                      {story.title}
                    </CardTitle>

                    {story.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {story.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      {story.audio_url && (
                        <span className="flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          Audio
                        </span>
                      )}
                      {story.is_interactive && (
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Make Choices
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => setSelectedStory(story)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {story.is_interactive ? "Play Story" : "Read Story"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Story Reader Modal */}
      <AnimatePresence>
        {showMasjidStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen p-4 flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-4xl">
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white rounded-full" onClick={() => setShowMasjidStory(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <Card className="bg-white shadow-2xl">
                  <CardContent className="p-6 md:p-10 space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold">The Day the Masjid Smiled</h2>
                    <div className="text-gray-700 space-y-3">
                      <p>Muhammad and Zaid were best friends who loved going to the masjid. One sunny afternoon, their teacher, Ustadh Haroon, gathered all the children and said: “Today, we will learn adab — the beautiful manners that Allah loves.” The boys looked at each other with excitement. They had already learned Salah and Wudu… but today felt special.</p>
                      <h3 className="font-semibold">🌿 Chapter 1: The Greeting That Brings Rewards</h3>
                      <p>As the boys entered the masjid, Muhammad smiled and said: “Assalamu Alaikum wa Rahmatullah!” Zaid replied: “Wa Alaikumussalam wa Rahmatullah!” Ustadh Haroon said: “Spread salam among yourselves.” (Sahih Muslim)</p>
                      <h3 className="font-semibold">🌿 Chapter 2: Respecting Parents</h3>
                      <p>Ustadh asked the children to thank their parents. “The pleasure of Allah is in the pleasure of the parents.” (Tirmidhi)</p>
                      <h3 className="font-semibold">🌿 Chapter 3: Keeping the Masjid Clean</h3>
                      <p>Zaid picked up a tissue on the carpet. “Cleanliness is half of faith.” (Sahih Muslim)</p>
                      <h3 className="font-semibold">🌿 Chapter 4: Speaking Kindly</h3>
                      <p>Allah says: “And speak to people good words.” (Quran 2:83)</p>
                      <h3 className="font-semibold">🌿 Chapter 5: Sharing Is Caring</h3>
                      <p>“None of you truly believes until he loves for his brother what he loves for himself.” (Bukhari & Muslim)</p>
                      <h3 className="font-semibold">⭐ Key Islamic Etiquettes</h3>
                      <ul className="list-disc ml-6 text-sm">
                        <li>Say Salam</li>
                        <li>Respect parents and elders</li>
                        <li>Keep the masjid and home clean</li>
                        <li>Speak kindly</li>
                        <li>Share and care for others</li>
                        <li>Be gentle and thankful</li>
                      </ul>
                    </div>

                    <div className="mt-6 p-4 border rounded-lg">
                      <h3 className="text-xl font-bold mb-2">🧠 Kids Quiz</h3>
                      {[
                        { q: 'What should we say when greeting someone in Islam?', opts: ['Hello', 'Good morning', 'Assalamu Alaikum'], correct: 2 },
                        { q: 'Who said “Spread Salam among yourselves”?', opts: ['Teacher', 'Prophet Muhammad ﷺ', 'A neighbour'], correct: 1 },
                        { q: 'Why should we respect our parents?', opts: ['Because everyone does it', 'Because Allah is pleased when parents are pleased', 'For fun'], correct: 1 },
                        { q: 'What did Zaid pick up in the masjid?', opts: ['A toy', 'A tissue', 'A book'], correct: 1 },
                        { q: 'Cleanliness is…', opts: ['A little good', 'Half of faith', 'Not important'], correct: 1 },
                        { q: 'What kind of words should we speak?', opts: ['Loud and rude', 'None', 'Kind and gentle'], correct: 2 },
                        { q: 'Sharing with others shows…', opts: ['Greed', 'Good manners', 'Anger'], correct: 1 },
                        { q: 'What makes the masjid happy?', opts: ['Running inside', 'Keeping it clean', 'Shouting loudly'], correct: 1 },
                        { q: 'Who brought dates for the class?', opts: ['Zaid', 'Muhammad', 'Ustadh Haroon'], correct: 2 },
                        { q: 'What does Allah like?', opts: ['Good manners and kindness', 'Fighting', 'Shouting'], correct: 0 }
                      ].map((item, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="font-medium">{idx + 1}. {item.q}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.opts.map((opt, oi) => (
                              <label key={oi} className={`text-sm px-3 py-1 border rounded cursor-pointer ${quizAnswers[idx] === oi ? 'bg-blue-100 border-blue-400' : ''}`}>
                                <input type="radio" name={`q${idx}`} value={oi} className="hidden" onChange={() => setQuizAnswers(prev => { const next = [...prev]; next[idx] = oi; return next; })} />
                                {String.fromCharCode(65 + oi)}) {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-3 mt-4">
                        <Button onClick={async () => {
                          const key = [
                            { correct: 2 },{ correct: 1 },{ correct: 1 },{ correct: 1 },{ correct: 1 },{ correct: 2 },{ correct: 1 },{ correct: 1 },{ correct: 2 },{ correct: 0 }
                          ]
                          let score = 0
                          for (let i = 0; i < 10; i++) {
                            if (quizAnswers[i] === key[i].correct) score++
                          }
                          setQuizStatus('Submitting...')
                          try {
                            const { quizApi } = await import('@/api/firebase')
                            await quizApi.submit({ storyId: 'masjid-smiled', answers: quizAnswers, score, meta: { title: 'The Day the Masjid Smiled' } })
                            try {
                              const { data: userData } = await supabase.auth.getUser()
                              const userObj = userData?.user ? { id: userData.user.id, email: userData.user.email } : null
                              await awardPointsForGame(userObj, 'story_quiz', { isPerfect: score === 10, fallbackScore: score, metadata: { storyId: 'masjid-smiled' } })
                            } catch {}
                            setQuizStatus(`Submitted! Score: ${score}/10`)
                          } catch (e) {
                            setQuizStatus('Failed to submit')
                          }
                        }}>Submit Answers</Button>
                        {quizStatus && <span className="text-sm text-gray-600">{quizStatus}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
        {showGuestStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen p-4 flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-4xl">
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white rounded-full" onClick={() => setShowGuestStory(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <Card className="bg-white shadow-2xl">
                  <CardContent className="p-6 md:p-10 space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold">The Guest Who Taught Them Manners</h2>
                    <div className="text-gray-700 space-y-3">
                      <p>It was a peaceful Saturday morning. Muhammad and Zaid were playing in the garden when Muhammad’s mother called out: “Boys! We have a special guest coming today. Please get ready!”</p>
                      <h3 className="font-semibold">🍃 Chapter 1: Preparing for the Guest</h3>
                      <p>They cleaned and prepared. “Whoever believes in Allah and the Last Day should honor his guest.” (Sahih Bukhari)</p>
                      <h3 className="font-semibold">🍃 Chapter 2: A Gentle Knock</h3>
                      <p>They greeted Uncle Salim with “Assalamu Alaikum wa Rahmatullah!” and he felt welcomed.</p>
                      <h3 className="font-semibold">🍃 Chapter 3: Offering Water and Food</h3>
                      <p>They offered water and dates. Giving water is from the best charity.</p>
                      <h3 className="font-semibold">🍃 Chapter 4: Speaking with Respect</h3>
                      <p>“Lower your voice… and speak in a good way.” (Quran 31:19)</p>
                      <h3 className="font-semibold">🍃 Chapter 5: Helping Without Being Asked</h3>
                      <p>They served and cleaned without being asked. “This is the Sunnah — serving guests with your own hands.”</p>
                      <h3 className="font-semibold">🍃 Chapter 6: The Secret Gift</h3>
                      <p>Uncle Salim gifted miswaks and reminded them that good manners make a person shine.</p>
                      <h3 className="font-semibold">🌟 Etiquettes Learned</h3>
                      <ul className="list-disc ml-6 text-sm">
                        <li>Honor guests</li>
                        <li>Offer water and food</li>
                        <li>Speak gently and listen</li>
                        <li>Help without being asked</li>
                        <li>Say Salam with joy</li>
                        <li>Keep clean and prepare home</li>
                      </ul>
                    </div>
                    <div className="mt-6 p-4 border rounded-lg">
                      <h3 className="text-xl font-bold mb-2">🧠 Kids Quiz</h3>
                      {[
                        { q: 'What does the Prophet ﷺ say about guests?', opts: ['Ignore them', 'Honor them', 'Make them wait outside'], correct: 1 },
                        { q: 'What should you offer a guest first?', opts: ['Toys', 'Water', 'Money'], correct: 1 },
                        { q: 'Who was the special guest?', opts: ['A teacher', 'A neighbor', 'Uncle Salim'], correct: 2 },
                        { q: 'What did Zaid and Muhammad say when they opened the door?', opts: ['Hello', 'Assalamu Alaikum', 'Good afternoon'], correct: 1 },
                        { q: 'What gift did the boys receive?', opts: ['A book', 'Miswaks', 'Sweets'], correct: 1 },
                        { q: 'What did the boys do after the meal?', opts: ['Ran away', 'Started shouting', 'Helped clean'], correct: 2 },
                        { q: 'Good manners make a person…', opts: ['Angry', 'Forgetful', 'Shine'], correct: 2 },
                        { q: 'Listening without interrupting is…', opts: ['Rude', 'Good adab', 'Lazy'], correct: 1 },
                        { q: 'Who said “Lower your voice… and speak in a good way”?', opts: ['The Prophet ﷺ', 'Qur’an', 'A neighbor'], correct: 1 },
                        { q: 'What did the boys learn today?', opts: ['How to play games', 'Islamic etiquette', 'How to sleep early'], correct: 1 }
                      ].map((item, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="font-medium">{idx + 1}. {item.q}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.opts.map((opt, oi) => (
                              <label key={oi} className={`text-sm px-3 py-1 border rounded cursor-pointer ${guestQuizAnswers[idx] === oi ? 'bg-blue-100 border-blue-400' : ''}`}>
                                <input type="radio" name={`gq${idx}`} value={oi} className="hidden" onChange={() => setGuestQuizAnswers(prev => { const next = [...prev]; next[idx] = oi; return next; })} />
                                {String.fromCharCode(65 + oi)}) {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 mt-4">
                        <Button onClick={async () => {
                          const key = [1,1,2,1,1,2,2,1,1,1]
                          let score = 0
                          for (let i = 0; i < 10; i++) {
                            if (guestQuizAnswers[i] === key[i]) score++
                          }
                          setGuestQuizStatus('Submitting...')
                          try {
                            const { quizApi } = await import('@/api/firebase')
                            await quizApi.submit({ storyId: 'guest-manners', answers: guestQuizAnswers, score, meta: { title: 'The Guest Who Taught Them Manners' } })
                            try {
                              const { data: userData } = await supabase.auth.getUser()
                              const userObj = userData?.user ? { id: userData.user.id, email: userData.user.email } : null
                              await awardPointsForGame(userObj, 'story_quiz', { isPerfect: score === 10, fallbackScore: score, metadata: { storyId: 'guest-manners' } })
                            } catch {}
                            setGuestQuizStatus(`Submitted! Score: ${score}/10`)
                          } catch (e) {
                            setGuestQuizStatus('Failed to submit')
                          }
                        }}>Submit Answers</Button>
                        {guestQuizStatus && <span className="text-sm text-gray-600">{guestQuizStatus}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-4 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-5xl"
              >
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => setSelectedStory(null)}
                    variant="ghost"
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Story Content */}
                {selectedStory.is_interactive ? (
                  <InteractiveStoryPlayer
                    story={selectedStory}
                    onComplete={() => setSelectedStory(null)}
                  />
                ) : (
                  <Card className="bg-white shadow-2xl">
                    {selectedStory.image_url && (
                      <div className="h-64 md:h-96 overflow-hidden rounded-t-xl">
                        <img
                          src={selectedStory.image_url}
                          alt={selectedStory.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 md:p-10">
                      <div className="mb-6">
                        <Badge className="mb-4">
                          {categories.find(c => c.id === selectedStory.category)?.icon} {selectedStory.category}
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          {selectedStory.title}
                        </h1>
                      </div>

                      {selectedStory.audio_url && (
                        <div className="mb-6 bg-purple-50 p-4 rounded-xl">
                          <audio controls className="w-full">
                            <source src={selectedStory.audio_url} type="audio/mpeg" />
                            Your browser does not support audio.
                          </audio>
                        </div>
                      )}

                      <div className="prose prose-lg max-w-none mb-8">
                        <ReactMarkdown>{selectedStory.content}</ReactMarkdown>
                      </div>

                      {selectedStory.moral && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                          <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            Moral of the Story
                          </h3>
                          <p className="text-gray-700 text-lg">{selectedStory.moral}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
