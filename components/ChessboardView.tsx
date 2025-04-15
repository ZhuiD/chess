import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import { Chess } from 'chess.js';

interface ChessboardViewProps {
  fen: string;
  size?: number;
}

// 棋子的字符映射
const PIECE_SYMBOLS = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',  // 黑棋
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',  // 白棋
};

/**
 * 棋盘视图组件 - 使用SVG绘制棋盘
 * @param fen - FEN表示法的棋盘位置
 * @param size - 棋盘大小，默认为200
 */
export const ChessboardView: React.FC<ChessboardViewProps> = ({ 
  fen, 
  size = 200 
}) => {
  // 使用默认的起始位置FEN，如果没有提供FEN或FEN无效
  const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  
  // 创建chess.js实例并验证FEN
  let chess;
  try {
    chess = new Chess(fen);
  } catch (e) {
    // 如果FEN无效，使用默认FEN
    chess = new Chess(defaultFen);
  }
  
  // 获取当前棋盘位置
  const board = chess.board();
  
  // 计算单个方格的大小
  const squareSize = size / 8;
  
  // 渲染棋盘
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* 渲染棋盘方格 */}
        {Array.from({ length: 8 }).map((_, row) => (
          Array.from({ length: 8 }).map((_, col) => {
            const isDark = (row + col) % 2 === 1;
            return (
              <Rect
                key={`${row}-${col}`}
                x={col * squareSize}
                y={row * squareSize}
                width={squareSize}
                height={squareSize}
                fill={isDark ? '#b58863' : '#f0d9b5'}
              />
            );
          })
        ))}
        
        {/* 渲染棋子 - 使用SVG基本形状 */}
        {board.map((row, rowIndex) => (
          row.map((piece, colIndex) => {
            if (!piece) return null;
            
            const isWhite = piece.color === 'w';
            
            // 基于棋子类型创建不同形状
            switch (piece.type.toLowerCase()) {
              case 'p': // 兵
                return (
                  <G key={`piece-${rowIndex}-${colIndex}`}>
                    <Circle 
                      cx={colIndex * squareSize + squareSize / 2}
                      cy={rowIndex * squareSize + squareSize / 2}
                      r={squareSize * 0.3}
                      fill={isWhite ? '#fff' : '#000'}
                      stroke="#333"
                      strokeWidth={1}
                    />
                  </G>
                );
              case 'r': // 车
                return (
                  <G key={`piece-${rowIndex}-${colIndex}`}>
                    <Rect 
                      x={colIndex * squareSize + squareSize * 0.2}
                      y={rowIndex * squareSize + squareSize * 0.2}
                      width={squareSize * 0.6}
                      height={squareSize * 0.6}
                      fill={isWhite ? '#fff' : '#000'}
                      stroke="#333"
                      strokeWidth={1}
                    />
                  </G>
                );
              case 'n': // 马
                return (
                  <G key={`piece-${rowIndex}-${colIndex}`}>
                    <Rect 
                      x={colIndex * squareSize + squareSize * 0.2}
                      y={rowIndex * squareSize + squareSize * 0.2}
                      width={squareSize * 0.6}
                      height={squareSize * 0.6}
                      fill={isWhite ? '#fff' : '#000'}
                      stroke="#333"
                      strokeWidth={1}
                      transform={`rotate(45, ${colIndex * squareSize + squareSize / 2}, ${rowIndex * squareSize + squareSize / 2})`}
                    />
                  </G>
                );
              case 'b': // 象
                return (
                  <G key={`piece-${rowIndex}-${colIndex}`}>
                    <Circle 
                      cx={colIndex * squareSize + squareSize / 2}
                      cy={rowIndex * squareSize + squareSize / 2}
                      r={squareSize * 0.3}
                      fill={isWhite ? '#fff' : '#000'}
                      stroke="#333"
                      strokeWidth={1}
                    />
                    <Circle 
                      cx={colIndex * squareSize + squareSize / 2}
                      cy={rowIndex * squareSize + squareSize / 2}
                      r={squareSize * 0.15}
                      fill={isWhite ? '#ccc' : '#333'}
                    />
                  </G>
                );
              case 'q': // 后
                return (
                  <G key={`piece-${rowIndex}-${colIndex}`}>
                    <Circle 
                      cx={colIndex * squareSize + squareSize / 2}
                      cy={rowIndex * squareSize + squareSize / 2}
                      r={squareSize * 0.3}
                      fill={isWhite ? '#fff' : '#000'}
                      stroke="#333"
                      strokeWidth={1}
                    />
                    <Circle 
                      cx={colIndex * squareSize + squareSize / 2}
                      cy={rowIndex * squareSize + squareSize / 2}
                      r={squareSize * 0.15}
                      fill={isWhite ? '#ccc' : '#333'}
                      stroke="#444"
                      strokeWidth={1}
                    />
                  </G>
                );
              case 'k': // 王
                return (
                  <G key={`piece-${rowIndex}-${colIndex}`}>
                    <Circle 
                      cx={colIndex * squareSize + squareSize / 2}
                      cy={rowIndex * squareSize + squareSize / 2}
                      r={squareSize * 0.3}
                      fill={isWhite ? '#fff' : '#000'}
                      stroke="#333"
                      strokeWidth={2}
                    />
                    <SvgText
                      x={colIndex * squareSize + squareSize / 2}
                      y={rowIndex * squareSize + squareSize / 2 + squareSize * 0.1}
                      fontSize={squareSize * 0.3}
                      fill={isWhite ? '#000' : '#fff'}
                      textAnchor="middle"
                    >
                      +
                    </SvgText>
                  </G>
                );
              default:
                return null;
            }
          })
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0d9b5',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
}); 