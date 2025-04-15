import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { ChessboardView } from '../components/ChessboardView';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useBypassAuth } from './_layout';

// 定义棋局数据类型
interface ChessGame {
  id: number;
  white: string;
  black: string;
  result: string;
  date: string;
  opening: string;
  tag: string;
  fen: string;
}

interface ChessDataType {
  [date: string]: ChessGame[];
}

// 模拟棋局数据
const mockChessData: ChessDataType = {
  '2025-03-15': [
    {
      id: 1,
      white: 'Mike',
      black: 'Lily',
      result: 'White wins',
      date: '2025.3.15',
      opening: 'Bird Opening',
      tag: 'f4',
      fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    },
    {
      id: 2,
      white: 'Mike',
      black: 'Lily',
      result: 'Black wins',
      date: '2025.3.15',
      opening: 'Queen\'s Gambit',
      tag: 'd4 d5',
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
    },
    {
      id: 3,
      white: 'Mike',
      black: 'Lily',
      result: 'Draw',
      date: '2025.3.15',
      opening: 'Ruy Lopez',
      tag: 'e4 e5 Nf3 Nc6 Bb5',
      fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    },
  ],
  '2025-03-20': [
    {
      id: 4,
      white: 'Mike',
      black: 'Lily',
      result: 'White wins',
      date: '2025.3.20',
      opening: 'Queen\'s Pawn Opening',
      tag: 'd4',
      fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
    },
  ],
};

interface WeekDay {
  date: number;
  day: string;
  fullDate: string;
  isSelected: boolean;
  hasGames: boolean;
}

interface WeekCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

// 一周日历组件
function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(moment(selectedDate));
  
  // 生成一周的日期
  const getWeekDays = useCallback((): WeekDay[] => {
    const startOfWeek = moment(currentWeek).startOf('week');
    const weekDays: WeekDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, 'days');
      const dateStr = day.format('YYYY-MM-DD');
      weekDays.push({
        date: day.date(),
        day: day.format('ddd').toUpperCase(),
        fullDate: dateStr,
        isSelected: dateStr === moment(selectedDate).format('YYYY-MM-DD'),
        hasGames: mockChessData[dateStr] ? true : false,
      });
    }
    
    return weekDays;
  }, [currentWeek, selectedDate]);

  // 前一周
  const previousWeek = () => {
    setCurrentWeek(moment(currentWeek).subtract(1, 'week'));
  };

  // 后一周
  const nextWeek = () => {
    setCurrentWeek(moment(currentWeek).add(1, 'week'));
  };
  
  return (
    <View style={styles.calendarContainer}>
      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={previousWeek}>
          <Text style={styles.navButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthYearText}>{currentWeek.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={nextWeek}>
          <Text style={styles.navButton}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekDaysContainer}>
        {getWeekDays().map((day, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.dayItem, 
              day.isSelected && styles.selectedDay
            ]}
            onPress={() => onDateSelect(day.fullDate)}
          >
            <Text style={[styles.dayOfWeek, day.isSelected && styles.selectedText]}>{day.day}</Text>
            <Text style={[styles.dayNumber, day.isSelected && styles.selectedText]}>{day.date}</Text>
            {day.hasGames && <View style={[styles.gameIndicator, day.isSelected && styles.selectedIndicator]} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface ChessGameCardProps {
  game: ChessGame;
}

// 棋局卡片组件
function ChessGameCard({ game }: ChessGameCardProps) {
  return (
    <View style={styles.gameCard}>
      <View style={styles.redDot} />
      <View style={styles.gameContent}>
        <View style={styles.chessboardContainer}>
          <ChessboardView fen={game.fen} size={80} />
        </View>
        <View style={styles.gameInfo}>
          <Text style={styles.gameInfoText}>Who: {game.white} VS {game.black}</Text>
          <Text style={styles.gameInfoText}>Result: {game.result}</Text>
          <Text style={styles.gameInfoText}>Date: {game.date}</Text>
          <Text style={styles.gameInfoText}>Opening: {game.opening}</Text>
          <Text style={styles.gameInfoText}>Tag: {game.tag}</Text>
        </View>
      </View>
    </View>
  );
}

interface MonthCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  showCalendar: boolean;
  onClose: () => void;
}

// 月历组件
function MonthCalendar({ selectedDate, onDateSelect, showCalendar, onClose }: MonthCalendarProps) {
  if (!showCalendar) return null;
  
  const [date, setDate] = useState(new Date(selectedDate));
  const [monthToDisplay, setMonthToDisplay] = useState(moment(selectedDate).startOf('month'));
  
  // 生成月历数据
  const generateCalendarDays = useCallback(() => {
    const startOfMonth = moment(monthToDisplay).startOf('month');
    const startDay = moment(startOfMonth).startOf('week');
    const endDay = moment(startOfMonth).endOf('month').endOf('week');
    
    const calendarDays = [];
    let currentDay = startDay.clone();
    
    while (currentDay.isSameOrBefore(endDay)) {
      const dateStr = currentDay.format('YYYY-MM-DD');
      const isCurrentMonth = currentDay.month() === monthToDisplay.month();
      const isSelected = dateStr === moment(selectedDate).format('YYYY-MM-DD');
      const hasGames = mockChessData[dateStr] ? true : false;
      
      calendarDays.push({
        date: currentDay.date(),
        month: currentDay.month(),
        fullDate: dateStr,
        isCurrentMonth,
        isSelected,
        hasGames,
      });
      
      currentDay.add(1, 'day');
    }
    
    return calendarDays;
  }, [monthToDisplay, selectedDate]);
  
  // 前一个月
  const previousMonth = () => {
    setMonthToDisplay(moment(monthToDisplay).subtract(1, 'month'));
  };
  
  // 后一个月
  const nextMonth = () => {
    setMonthToDisplay(moment(monthToDisplay).add(1, 'month'));
  };
  
  // 处理日期选择
  const handleDateSelection = (fullDate: string) => {
    setDate(new Date(fullDate));
    onDateSelect(fullDate);
    onClose();
  };
  
  // 获取所有日历日期
  const calendarDays = generateCalendarDays();
  
  // 生成日历网格
  const renderCalendarGrid = () => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return (
      <View style={styles.customCalendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={previousMonth}>
            <Text style={styles.calendarNavButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calendarMonthYearText}>
            {monthToDisplay.format('YYYY年MM月')}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Text style={styles.calendarNavButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekdaysRow}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.daysContainer}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                !day.isCurrentMonth && styles.otherMonthDay,
                day.isSelected && styles.selectedCalendarDay,
              ]}
              onPress={() => handleDateSelection(day.fullDate)}
            >
              <Text style={[
                styles.calendarDayText,
                !day.isCurrentMonth && styles.otherMonthDayText,
                day.isSelected && styles.selectedCalendarDayText,
              ]}>
                {day.date}
              </Text>
              {day.hasGames && (
                <View style={[
                  styles.calendarGameIndicator,
                  day.isSelected && styles.selectedCalendarGameIndicator
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>关闭</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.monthCalendarContainer}>
      {renderCalendarGrid()}
    </View>
  );
}

// 用户信息组件
function UserProfile() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { bypassAuth, setBypassAuth } = useBypassAuth();
  
  const handleSignOut = async () => {
    if (bypassAuth) {
      // 如果是绕过认证模式，只需重置状态
      setBypassAuth(false);
      router.push('/(auth)/login');
    } else {
      // 常规登出流程
      await signOut();
      router.push('/(auth)/login');
    }
  };
  
  // 如果绕过认证或正常登录，显示用户资料
  if (bypassAuth || (isSignedIn && user)) {
    return (
      <View style={styles.userProfileContainer}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {bypassAuth ? '访客用户' : (user?.firstName || user?.emailAddresses[0]?.emailAddress || '用户')}
          </Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return null;
}

export default function ChessHistoryScreen() {
  const [selectedDate, setSelectedDate] = useState('2025-03-15');
  const [showCalendar, setShowCalendar] = useState(false);
  const { isSignedIn } = useAuth();
  const { bypassAuth } = useBypassAuth();
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };
  
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  
  const gamesForSelectedDay = mockChessData[selectedDate] || [];
  
  return (
    <SafeAreaView style={styles.container}>
      <UserProfile />
      <Text style={styles.appTitle}>国际象棋历史记录</Text>
      
      <WeekCalendar 
        selectedDate={selectedDate} 
        onDateSelect={handleDateSelect} 
      />
      
      <TouchableOpacity 
        style={styles.calendarButton} 
        onPress={toggleCalendar}
      >
        <Text style={styles.calendarButtonText}>查看月历</Text>
      </TouchableOpacity>
      
      <MonthCalendar 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        showCalendar={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
      
      <Text style={styles.historyTitle}>棋局历史记录</Text>
      
      <ScrollView style={styles.gamesContainer}>
        {gamesForSelectedDay.length > 0 ? (
          gamesForSelectedDay.map(game => (
            <ChessGameCard key={game.id} game={game} />
          ))
        ) : (
          <Text style={styles.noGamesText}>该日没有棋局记录</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 10,
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  navButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: '#000',
    borderRadius: 20,
  },
  selectedText: {
    color: 'white',
  },
  selectedIndicator: {
    backgroundColor: 'white',
  },
  dayOfWeek: {
    fontSize: 12,
    color: '#555',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  gameIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000',
    marginTop: 2,
  },
  calendarButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  calendarButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  monthCalendarContainer: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    maxHeight: '80%',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
  },
  gamesContainer: {
    padding: 10,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d9534f',
    margin: 15,
  },
  gameContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  chessboardContainer: {
    marginRight: 10,
  },
  gameInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  gameInfoText: {
    fontSize: 14,
    marginBottom: 3,
  },
  noGamesText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  userProfileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  signOutButtonText: {
    color: '#d9534f',
    fontSize: 14,
  },
  customCalendarContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarNavButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarMonthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 12,
    color: '#555',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDay: {
    width: '13%',
    height: 40,
    margin: '0.5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  otherMonthDay: {
    backgroundColor: '#f5f5f5',
  },
  selectedCalendarDay: {
    backgroundColor: '#007BFF',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  otherMonthDayText: {
    color: '#ccc',
  },
  selectedCalendarDayText: {
    color: 'white',
  },
  calendarGameIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d9534f',
    marginTop: 3,
  },
  selectedCalendarGameIndicator: {
    backgroundColor: 'white',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 