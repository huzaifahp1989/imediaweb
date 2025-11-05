import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Mail, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      color: "from-blue-500 to-cyan-500",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, we collect basic information such as your child's name, age, city, and email address. We only collect the minimum information necessary to provide our services."
        },
        {
          subtitle: "Usage Data",
          text: "We collect information about how you use our website, including pages visited, games played, and learning progress. This helps us improve our services and provide a better experience."
        },
        {
          subtitle: "Recordings and Submissions",
          text: "If your child submits audio recordings, drawings, or writings through our platform, we store this content along with the associated user information."
        }
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      color: "from-green-500 to-emerald-500",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to provide access to educational content, games, and learning materials on our platform."
        },
        {
          subtitle: "Progress Tracking",
          text: "We track learning progress, points, and achievements to motivate children and provide personalized learning experiences."
        },
        {
          subtitle: "Communication",
          text: "We may send important updates about the platform, new features, or educational content. We will never send spam or share your email with third parties."
        },
        {
          subtitle: "Improvement",
          text: "We analyze usage patterns to improve our content and make the learning experience better for all children."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "Children's Privacy",
      color: "from-purple-500 to-pink-500",
      content: [
        {
          subtitle: "Age Requirements",
          text: "Our service is designed for children aged 3-18. We take children's privacy very seriously and comply with applicable children's privacy laws."
        },
        {
          subtitle: "Parental Consent",
          text: "We encourage parents to be involved in their children's online activities. Parents can request to review, update, or delete their child's information at any time."
        },
        {
          subtitle: "Safe Environment",
          text: "We maintain a safe, ad-free environment. We never show advertisements or share children's information with third-party advertisers."
        },
        {
          subtitle: "No Public Profiles",
          text: "Children's profiles and personal information are not publicly visible. Only usernames and points appear on leaderboards."
        }
      ]
    },
    {
      icon: Shield,
      title: "Data Protection & Security",
      color: "from-amber-500 to-orange-500",
      content: [
        {
          subtitle: "Secure Storage",
          text: "We use industry-standard security measures to protect your information. All data is stored securely using encryption."
        },
        {
          subtitle: "Access Control",
          text: "Access to personal information is restricted to authorized personnel only, and only when necessary for service delivery."
        },
        {
          subtitle: "No Data Selling",
          text: "We will never sell, rent, or trade your personal information or your child's information to third parties."
        }
      ]
    },
    {
      icon: AlertCircle,
      title: "Third-Party Services",
      color: "from-red-500 to-rose-500",
      content: [
        {
          subtitle: "External Links",
          text: "Our website may contain links to external websites (e.g., SearchTruth.com for Hadith search). We are not responsible for the privacy practices of these external sites."
        },
        {
          subtitle: "Analytics",
          text: "We may use basic analytics to understand how our service is used, but we do not share personal information with analytics providers."
        },
        {
          subtitle: "Content Delivery",
          text: "We use secure content delivery networks (CDNs) to serve Quran audio and other educational content."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      color: "from-indigo-500 to-purple-500",
      content: [
        {
          subtitle: "Access Your Data",
          text: "You have the right to access all personal information we hold about you or your child."
        },
        {
          subtitle: "Update Information",
          text: "You can update your profile information at any time through your account settings."
        },
        {
          subtitle: "Delete Account",
          text: "You can request deletion of your account and all associated data at any time by contacting us."
        },
        {
          subtitle: "Data Portability",
          text: "You can request a copy of your data in a portable format."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your privacy and your child's safety are our top priorities
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: January 2025
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="border-2 border-blue-300 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Islam Kids Zone. We are committed to protecting your privacy and ensuring a safe online environment for children. This Privacy Policy explains how we collect, use, and protect your information.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our website, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies, please do not use our service.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-8 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-bold text-gray-900 mb-2">{item.subtitle}</h4>
                        <p className="text-gray-700 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="border-2 border-amber-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardTitle className="text-2xl">🍪 Cookies & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700">
                <strong>What are cookies?</strong> Cookies are small text files stored on your device that help us remember your preferences and provide a better experience.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., login sessions).</p>
                <p className="text-gray-700"><strong>Analytics Cookies:</strong> Help us understand how visitors use our site to improve it.</p>
              </div>
              <p className="text-gray-700">
                You can disable cookies in your browser settings, but this may affect your ability to use certain features of our website.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <Card className="border-2 border-green-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="text-2xl">⏱️ Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                We retain your personal information only for as long as necessary to provide our services and comply with legal obligations.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Active Accounts:</strong> Data is retained while your account is active.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Inactive Accounts:</strong> Accounts inactive for 2 years may be deleted after notification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Deleted Accounts:</strong> Upon request, we delete all personal data within 30 days.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <Card className="border-2 border-purple-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="text-2xl">📝 Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p className="text-gray-700">
                We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-2 border-blue-300 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, or if you want to exercise your rights regarding your personal information, please contact us:
              </p>
              <div className="bg-white p-6 rounded-xl border-2 border-blue-200">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href="mailto:huzaify786@gmail.com" className="text-blue-600 hover:text-blue-700 underline">huzaify786@gmail.com</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>WhatsApp:</strong> <a href="https://wa.me/447447999284" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">+44 744 799 9284</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Contact Page:</strong> <Link to={createPageUrl("ContactUs")} className="text-blue-600 hover:text-blue-700 underline">Visit our Contact Page</Link>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                We aim to respond to all privacy-related inquiries within 48 hours.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 text-sm">
            Islam Kids Zone is committed to creating a safe, educational, and enjoyable online experience for Muslim children worldwide. 🌙
          </p>
        </motion.div>
      </div>
    </div>
  );
}