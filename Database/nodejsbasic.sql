-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 11, 2023 lúc 09:02 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `nodejsbasic`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `code`
--

CREATE TABLE `code` (
  `idCode` int(11) NOT NULL,
  `source` text NOT NULL,
  `idUser` int(11) NOT NULL,
  `idTest` int(11) NOT NULL,
  `point` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `code`
--

INSERT INTO `code` (`idCode`, `source`, `idUser`, `idTest`, `point`) VALUES
(2, '', 1, 8, 10),
(3, '', 1, 8, 10),
(4, '', 1, 8, 10),
(5, '', 1, 1, 10),
(6, '', 2, 1, 10),
(7, '', 17, 1, 10),
(8, '', 17, 10, 10),
(9, '', 1, 11, 8);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `test`
--

CREATE TABLE `test` (
  `idTest` int(11) NOT NULL,
  `nameTest` varchar(255) NOT NULL,
  `detail` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `test`
--

INSERT INTO `test` (`idTest`, `nameTest`, `detail`) VALUES
(1, 'Two sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.'),
(3, 'Binary sequence generation', 'Given an integer n, write a program that generates all the binary sequences of length n in a lexicographic order.'),
(8, 'Enter number', 'Print Number Entered by User'),
(9, 'Fibonanci', 'The Fibonacci numbers are the numbers in the following integer sequence. 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, …….. Write a function int fib(int n) that returns Fn. For example, if n = 0, then fib() should return 0. If n = 1, then it should return 1. For n > 1, it should return Fn-1 + Fn-2. Examples: Input  : n = 2 Output : 1   or  Input  : n = 9   Output : 34'),
(10, 'Palindrome Number', 'Given an integer x, return true if x is a palindrome, and false otherwise.'),
(11, 'Roman to Integer', 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given a roman numeral, convert it to an integer.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `test_case`
--

CREATE TABLE `test_case` (
  `idTest_case` int(11) NOT NULL,
  `input` varchar(255) NOT NULL,
  `output` varchar(255) NOT NULL,
  `idTest` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `test_case`
--

INSERT INTO `test_case` (`idTest_case`, `input`, `output`, `idTest`) VALUES
(1, '1 2', '3', 1),
(2, '1', '1', 8),
(3, '2', '2', 8),
(4, '3', '3', 8),
(5, '5 7', '12', 1),
(6, '23 10', '33', 1),
(7, '1', '0, 1', 3),
(8, '2', '00, 01, 10, 11', 3),
(9, '3', '000, 001, 010, 011, 100, 101, 110, 111', 3),
(10, '1', '1', 9),
(11, '2', '1', 9),
(12, '3', '2', 9),
(13, '4', '3', 9),
(14, '5', '5', 9),
(15, '6', '8', 9),
(16, '7', '13', 9),
(17, '8', '21', 9),
(18, '9', '34', 9),
(19, '10', '55', 9),
(20, '121', 'true', 10),
(21, '123', 'false', 10),
(22, '12321', 'true', 10),
(23, '-123', 'false', 10),
(24, 'III', '3', 11),
(25, 'I', '1', 11),
(26, 'IIII', '-1', 11),
(27, 'V', '5', 11);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `idUser` int(255) NOT NULL,
  `account` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `point` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`idUser`, `account`, `password`, `fullname`, `point`) VALUES
(0, 'Admin', 'Admin123456', 'Admin', 0),
(1, 'vuq1506', '123456789', 'Vu Quyen', 7),
(2, 'ngh2711', '123456', 'Nguyen Huong', 0),
(3, 'phh1909', '123456', 'Pham Huy  ', 0),
(17, 'nguyenhuong2711', '150622', 'Nguyen Huong', 0),
(25, 'ngd0908', '123456', 'Nguyen Dat', 0),
(26, 'vul0706', '123456', 'Vu Loi', 0),
(27, 'vuh2707', '1231231', 'Vu Hung', 0),
(28, 'hot1506', '123456', 'Hoang Thanh', 0);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `code`
--
ALTER TABLE `code`
  ADD PRIMARY KEY (`idCode`),
  ADD KEY `idUser` (`idUser`),
  ADD KEY `idTest` (`idTest`);

--
-- Chỉ mục cho bảng `test`
--
ALTER TABLE `test`
  ADD PRIMARY KEY (`idTest`);

--
-- Chỉ mục cho bảng `test_case`
--
ALTER TABLE `test_case`
  ADD PRIMARY KEY (`idTest_case`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`idUser`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `code`
--
ALTER TABLE `code`
  MODIFY `idCode` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `test`
--
ALTER TABLE `test`
  MODIFY `idTest` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `test_case`
--
ALTER TABLE `test_case`
  MODIFY `idTest_case` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `idUser` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `code`
--
ALTER TABLE `code`
  ADD CONSTRAINT `code_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`),
  ADD CONSTRAINT `code_ibfk_2` FOREIGN KEY (`idTest`) REFERENCES `test` (`idTest`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
