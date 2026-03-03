;; title: tip-jar
;; version: 2.0.0
;; summary: Sats-Presso - Accept Bitcoin tips via sBTC
;; description: A full-featured tip jar contract that allows creators to receive sBTC tips.
;;              Features: profiles, goals/campaigns, preset amounts, and tip history.

;; =====================================
;; CONSTANTS
;; =====================================

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_CREATOR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_REGISTERED (err u102))
(define-constant ERR_INVALID_AMOUNT (err u103))
(define-constant ERR_TRANSFER_FAILED (err u104))
(define-constant ERR_INVALID_NAME (err u105))
(define-constant ERR_GOAL_NOT_FOUND (err u106))
(define-constant ERR_INVALID_PRESET (err u107))

;; Minimum tip amount (1 satoshi)
(define-constant MIN_TIP_AMOUNT u1)

;; Maximum presets per creator
(define-constant MAX_PRESETS u5)

;; =====================================
;; DATA VARIABLES
;; =====================================

;; Total tips processed through the platform
(define-data-var total-tips-processed uint u0)

;; Total number of registered creators
(define-data-var total-creators uint u0)

;; =====================================
;; DATA MAPS
;; =====================================

;; Creator profiles: principal -> profile data
(define-map creators
  principal
  {
    name: (string-utf8 50),
    bio: (string-utf8 280),
    total-received: uint,
    tip-count: uint,
    registered-at: uint
  }
)