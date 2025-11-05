import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Gift, Star, Sparkles, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PropTypes from 'prop-types';

const rewards = [
  { id: 1, label: "50 Points", value: 50, type: "points", color: "#10B981", icon: "⭐" },
  { id: 2, label: "Badge", value: "Super Learner", type: "badge", color: "#F59E0B", icon: "🏅" },
  { id: 3, label: "100 Points", value: 100, type: "points", color: "#3B82F6", icon: "💎" },
  { id: 4, label: "Wallpaper", value: "Islamic Art", type: "wallpaper", color: "#8B5CF6", icon: "🎨" },
  { id: 5, label: "25 Points", value: 25, type: "points", color: "#EC4899", icon: "✨" },
  { id: 6, label: "Giveaway Entry", value: "Monthly Prize", type: "giveaway_entry", color: "#EF4444", icon: "🎁" },
  { id: 7, label: "75 Points", value: 75, type: "points", color: "#14B8A6", icon: "🌟" },
  { id: 8, label: "Bonus Spin", value: "Extra Spin", type: "bonus_spin", color: "#F97316", icon: "🎯" },
];

export default function SpinToWinWheel({ user, onReward }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [canSpin, setCanSpin] = useState(true);
  const [nextSpinTime, setNextSpinTime] = useState(null);

  useEffect(() => {
    checkSpinAvailability();
  }, [user]);

  const checkSpinAvailability = () => {
    if (!user) return;
    
    const lastSpinDate = user.last_spin_date;
    if (!lastSpinDate) {
      setCanSpin(true);
      return;
    }

    const lastSpin = new Date(lastSpinDate);
    const now = new Date();
    const hoursSinceLastSpin = (now - lastSpin) / (1000 * 60 * 60);

    if (hoursSinceLastSpin >= 24) {
      setCanSpin(true);
    } else {
      setCanSpin(false);
      const nextSpin = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
      setNextSpinTime(nextSpin);
    }
  };

  const spin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);

    // Random number of full rotations (3-5) plus random position
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const segmentAngle = 360 / rewards.length;
    const targetAngle = randomIndex * segmentAngle;
    const fullRotations = 3 + Math.floor(Math.random() * 3);
    const totalRotation = fullRotations * 360 + targetAngle;

    setRotation(rotation + totalRotation);

    setTimeout(async () => {
      const wonReward = rewards[randomIndex];
      setSelectedReward(wonReward);
      setIsSpinning(false);

      // Save reward
      try {
        await base44.entities.SpinReward.create({
          user_id: user.id,
          reward_type: wonReward.type,
          reward_value: wonReward.type === "points" ? wonReward.value.toString() : wonReward.value,
          claimed: false
        });

        // Update user's last spin date
        await base44.auth.updateMe({
          last_spin_date: new Date().toISOString()
        });

        // Apply reward
        if (wonReward.type === "points") {
          const newPoints = Math.min((user.points || 0) + wonReward.value, 400);
          await base44.auth.updateMe({ points: newPoints });
        } else if (wonReward.type === "badge") {
          const badges = user.badges || [];
          if (!badges.includes(wonReward.value)) {
            await base44.auth.updateMe({ badges: [...badges, wonReward.value] });
          }
        }

        setCanSpin(false);
        checkSpinAvailability();

        if (onReward) onReward(wonReward);
      } catch (error) {
        console.error("Error saving reward:", error);
      }
    }, 4000);
  };

  const getTimeUntilNextSpin = () => {
    if (!nextSpinTime) return "";
    
    const now = new Date();
    const diff = nextSpinTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="border-2 border-amber-300 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <Gift className="w-6 h-6" />
          Spin to Win!
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Wheel Container */}
          <div className="relative w-80 h-80 mb-6">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg" />
            </div>

            {/* Wheel */}
            <motion.div
              className="w-full h-full rounded-full relative overflow-hidden border-8 border-amber-400 shadow-2xl"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: "easeOut" }}
            >
              {rewards.map((reward, index) => {
                const angle = (360 / rewards.length) * index;
                return (
                  <div
                    key={reward.id}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: "center",
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 w-0 h-0"
                      style={{
                        borderLeft: "160px solid transparent",
                        borderRight: "160px solid transparent",
                        borderTop: `160px solid ${reward.color}`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div
                        className="absolute text-center text-white font-bold text-sm"
                        style={{
                          top: "-140px",
                          left: "-40px",
                          width: "80px",
                          transform: "rotate(0deg)",
                        }}
                      >
                        <div className="text-2xl mb-1">{reward.icon}</div>
                        <div className="text-xs">{reward.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-amber-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
            </motion.div>
          </div>

          {/* Spin Button */}
          <Button
            onClick={spin}
            disabled={!canSpin || isSpinning}
            size="lg"
            className={`w-full max-w-xs ${
              canSpin && !isSpinning
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                : "bg-gray-400"
            }`}
          >
            {isSpinning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Zap className="w-5 h-5" />
                </motion.div>
                Spinning...
              </>
            ) : canSpin ? (
              <>
                <Star className="w-5 h-5 mr-2" />
                Spin Now!
              </>
            ) : (
              <>Next spin in: {getTimeUntilNextSpin()}</>
            )}
          </Button>

          {!canSpin && (
            <p className="text-sm text-gray-600 mt-3 text-center">
              You can spin once every 24 hours! ⏰
            </p>
          )}
        </div>

        {/* Reward Popup */}
        <AnimatePresence>
          {selectedReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
              onClick={() => setSelectedReward(null)}
            >
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
                  <p className="text-lg text-gray-700 mb-4">You won:</p>
                  <div className="text-3xl font-bold mb-6" style={{ color: selectedReward.color }}>
                    {selectedReward.label}
                  </div>
                  <Button
                    onClick={() => setSelectedReward(null)}
                    className="bg-gradient-to-r from-green-500 to-teal-500"
                  >
                    Awesome!
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

SpinToWinWheel.propTypes = {
  user: PropTypes.object.isRequired,
  onReward: PropTypes.func
};