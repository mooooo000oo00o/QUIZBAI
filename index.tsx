import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PlayerInput from '../components/PlayerInput';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import QuizButton from '../components/QuizButton';
import ResultScreen from '../components/ResultScreen';
import ScoreBoard from '../components/ScoreBoard';

type Question = {
  question: string;
  answers: string[];
  correct: string;
};

const questions: Question[] = [
  {
    question: 'What does CPU stand for?',
    answers: [
      'Central Processing Unit',
      'Computer Personal Unit',
      'Central Program Utility',
      'Computer Processing User',
    ],
    correct: 'Central Processing Unit',
  },
  {
    question: 'Which of the following is an input device?',
    answers: [
      'Monitor',
      'Keyboard',
      'Speaker',
      'Printer',
    ],
    correct: 'Keyboard',
  },
  {
    question: 'What does RAM stand for?',
    answers: [
      'Random Access Memory',
      'Read Access Memory',
      'Rapid Action Machine',
      'Random Application Module',
    ],
    correct: 'Random Access Memory',
  },
  {
    question: 'Which language is mainly used to style websites?',
    answers: [
      'HTML',
      'Python',
      'CSS',
      'Java',
    ],
    correct: 'CSS',
  },
  {
    question: 'What does URL stand for?',
    answers: [
      'Universal Resource Link',
      'Uniform Resource Locator',
      'User Resource Location',
      'Universal Routing Language',
    ],
    correct: 'Uniform Resource Locator',
  },
];

const HIGH_SCORE_KEY = '@quizbai_highest_score';
const HIGH_PLAYER_KEY = '@quizbai_highest_player';

export default function QuizBai() {
  const [playerName, setPlayerName] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [score, setScore] = useState(0);

  const [highestScore, setHighestScore] = useState(0);
  const [highestPlayer, setHighestPlayer] = useState('');

  const [isNewHighest, setIsNewHighest] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadHighestScore() {
      try {
        const savedScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        const savedPlayer = await AsyncStorage.getItem(HIGH_PLAYER_KEY);

        if (!mounted) {
          return;
        }

        if (savedScore !== null) {
          setHighestScore(Number(savedScore));
        }

        if (savedPlayer !== null) {
          setHighestPlayer(savedPlayer);
        }
      } catch (error) {
        console.log('Error loading highest score:', error);
      }
    }

    loadHighestScore();

    return () => {
      mounted = false;
    };
  }, []);

  const startQuiz = () => {
    if (playerName.trim() === '') {
      Alert.alert(
        'Enter your name',
        'Please enter your name before starting the quiz.'
      );
      return;
    }

    setStarted(true);
    setFinished(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsNewHighest(false);
  };

  const chooseAnswer = (answer: string) => {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answer);
  };

  const nextQuestion = async () => {
    if (selectedAnswer === null) {
      Alert.alert(
        'Choose an answer',
        'Please select an answer first.'
      );
      return;
    }

    const currentQuestion = questions[questionIndex];

    const isCorrect =
      selectedAnswer === currentQuestion.correct;

    const finalScore = isCorrect ? score + 1 : score;

    setScore(finalScore);

    if (questionIndex === questions.length - 1) {
      let newHighest = false;

      if (finalScore > highestScore) {
        newHighest = true;

        setHighestScore(finalScore);
        setHighestPlayer(playerName.trim());
        setIsNewHighest(true);

        try {
          await AsyncStorage.setItem(
            HIGH_SCORE_KEY,
            String(finalScore)
          );

          await AsyncStorage.setItem(
            HIGH_PLAYER_KEY,
            playerName.trim()
          );
        } catch (error) {
          console.log('Error saving highest score:', error);
        }
      } else {
        setIsNewHighest(false);
      }

      setFinished(true);

      if (newHighest) {
        console.log('New highest score!');
      }

      return;
    }

    setQuestionIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer(null);
  };

  const playAgain = () => {
    setFinished(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsNewHighest(false);
  };

  const goHome = () => {
    setStarted(false);
    setFinished(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsNewHighest(false);
  };

  if (!started) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={styles.startContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🧠</Text>

            <Text style={styles.logo}>
              Quiz<Text style={styles.logoGreen}>Bai</Text>
            </Text>

            <Text style={styles.tagline}>
              Learn. Think. Win! 🎯
            </Text>
          </View>

          <View style={styles.startCard}>
            <PlayerInput
              name={playerName}
              setName={setPlayerName}
            />

            <Pressable
              style={styles.startButton}
              onPress={startQuiz}
            >
              <Text style={styles.startButtonText}>
                🚀 START QUIZ
              </Text>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              🏆 Challenge Yourself
            </Text>

            <Text style={styles.infoText}>
              Answer 5 IT questions and see how high you can
              score!
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoItem}>
                📝 5 Questions
              </Text>

              <Text style={styles.infoItem}>
                ⭐ High Score
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom']}
      >
        <ResultScreen
          playerName={playerName}
          score={score}
          total={questions.length}
          highestScore={highestScore}
          highestPlayer={highestPlayer}
          isNewHighest={isNewHighest}
          onPlayAgain={playAgain}
        />
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[questionIndex];

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quizHeader}>
          <View>
            <Text style={styles.smallTitle}>
              QUIZBAI
            </Text>

            <Text style={styles.helloText}>
              Hi, {playerName}! 👋
            </Text>
          </View>

          <Pressable
            style={styles.homeButton}
            onPress={goHome}
          >
            <Text style={styles.homeButtonText}>
              🏠
            </Text>
          </Pressable>
        </View>

        <ScoreBoard
          score={score}
          highestScore={highestScore}
          highestPlayer={highestPlayer}
        />

        <ProgressBar
          current={questionIndex + 1}
          total={questions.length}
        />

        <QuestionCard
          question={currentQuestion.question}
        />

        <Text style={styles.chooseText}>
          Choose your answer:
        </Text>

        <View>
          {currentQuestion.answers.map((answer) => (
            <QuizButton
              key={answer}
              answer={answer}
              isSelected={selectedAnswer === answer}
              isCorrect={answer === currentQuestion.correct}
              disabled={selectedAnswer !== null}
              onPress={() => chooseAnswer(answer)}
            />
          ))}
        </View>

        {selectedAnswer !== null && (
          <View style={styles.feedbackCard}>
            {selectedAnswer === currentQuestion.correct ? (
              <>
                <Text style={styles.feedbackEmoji}>
                  🎉
                </Text>

                <View>
                  <Text style={styles.correctTitle}>
                    Correct!
                  </Text>

                  <Text style={styles.feedbackText}>
                    Great job! You got it right.
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.feedbackEmoji}>
                  💡
                </Text>

                <View>
                  <Text style={styles.wrongTitle}>
                    Not quite!
                  </Text>

                  <Text style={styles.feedbackText}>
                    The correct answer is{' '}
                    {currentQuestion.correct}.
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        <Pressable
          style={[
            styles.nextButton,
            selectedAnswer === null &&
              styles.nextButtonDisabled,
          ]}
          onPress={nextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {questionIndex === questions.length - 1
              ? 'FINISH QUIZ 🏆'
              : 'NEXT QUESTION →'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },

  startContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoEmoji: {
    fontSize: 55,
    marginBottom: 6,
  },

  logo: {
    color: '#222222',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },

  logoGreen: {
    color: '#20A957',
  },

  tagline: {
    color: '#777777',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  startCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  startButton: {
    backgroundColor: '#20A957',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  infoCard: {
    backgroundColor: '#E8F8EE',
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
  },

  infoTitle: {
    color: '#20A957',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },

  infoText: {
    color: '#666666',
    fontSize: 13,
    lineHeight: 19,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  infoItem: {
    color: '#444444',
    fontSize: 12,
    fontWeight: '800',
  },

  quizContent: {
    padding: 20,
    paddingBottom: 35,
  },

  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  smallTitle: {
    color: '#20A957',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  helloText: {
    color: '#222222',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 3,
  },

  homeButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },

  homeButtonText: {
    fontSize: 20,
  },

  chooseText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },

  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  feedbackEmoji: {
    fontSize: 27,
    marginRight: 12,
  },

  correctTitle: {
    color: '#20A957',
    fontSize: 15,
    fontWeight: '900',
  },

  wrongTitle: {
    color: '#D65353',
    fontSize: 15,
    fontWeight: '900',
  },

  feedbackText: {
    color: '#777777',
    fontSize: 12,
    marginTop: 2,
    maxWidth: 280,
  },

  nextButton: {
    backgroundColor: '#20A957',
    borderRadius: 17,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },

  nextButtonDisabled: {
    backgroundColor: '#BFDAC8',
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});