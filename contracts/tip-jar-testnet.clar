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

;; Creator goals/campaigns: principal -> goal data
(define-map creator-goals
  principal
  {
    goal-amount: uint,
    goal-description: (string-utf8 140),
    goal-deadline: uint,
    goal-active: bool
  }
)

;; Creator preset tip amounts: principal -> list of presets
(define-map creator-presets
  principal
  {
    preset-1: uint,
    preset-2: uint,
    preset-3: uint,
    preset-4: uint,
    preset-5: uint
  }
)

;; Tip history: tip-id -> tip details
(define-map tips
  uint
  {
    from: principal,
    to: principal,
    amount: uint,
    message: (string-utf8 280),
    timestamp: uint
  }
)

;; Track tip IDs per creator: (creator, index) -> tip-id
(define-map creator-tip-ids
  { creator: principal, index: uint }
  uint
)

;; Track tip IDs per tipper: (tipper, index) -> tip-id
(define-map tipper-tip-ids
  { tipper: principal, index: uint }
  uint
)

;; Track tip count per tipper
(define-map tipper-tip-counts
  principal
  uint
)

;; Tip counter for generating unique IDs
(define-data-var tip-counter uint u0)

;; =====================================
;; PUBLIC FUNCTIONS
;; =====================================

;; Register as a creator to receive tips
(define-public (register-creator (name (string-utf8 50)) (bio (string-utf8 280)))
  (let ((caller tx-sender))
    ;; Check if already registered
    (asserts! (is-none (map-get? creators caller)) ERR_ALREADY_REGISTERED)
    ;; Validate name is not empty
    (asserts! (> (len name) u0) ERR_INVALID_NAME)
    ;; Register the creator
    (map-set creators caller {
      name: name,
      bio: bio,
      total-received: u0,
      tip-count: u0,
      registered-at: burn-block-height
    })
    ;; Initialize default presets (1k, 5k, 10k, 25k, 50k sats)
    (map-set creator-presets caller {
      preset-1: u1000,
      preset-2: u5000,
      preset-3: u10000,
      preset-4: u25000,
      preset-5: u50000
    })
    ;; Increment creator count
    (var-set total-creators (+ (var-get total-creators) u1))
    ;; Emit event
    (print {
      event: "creator-registered",
      creator: caller,
      name: name,
      block: burn-block-height
    })
    (ok true)
  )
)

;; Update creator profile
(define-public (update-profile (name (string-utf8 50)) (bio (string-utf8 280)))
  (let (
    (caller tx-sender)
    (creator-data (unwrap! (map-get? creators caller) ERR_CREATOR_NOT_FOUND))
  )
    ;; Validate name
    (asserts! (> (len name) u0) ERR_INVALID_NAME)
    ;; Update profile keeping stats
    (map-set creators caller (merge creator-data {
      name: name,
      bio: bio
    }))
    (print {
      event: "profile-updated",
      creator: caller,
      name: name
    })
    (ok true)
  )
)