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

;; Set or update a funding goal/campaign
(define-public (set-goal (amount uint) (description (string-utf8 140)) (deadline uint))
  (let ((caller tx-sender))
    ;; Verify caller is a registered creator
    (asserts! (is-some (map-get? creators caller)) ERR_CREATOR_NOT_FOUND)
    ;; Validate amount
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    ;; Set the goal
    (map-set creator-goals caller {
      goal-amount: amount,
      goal-description: description,
      goal-deadline: deadline,
      goal-active: true
    })
    (print {
      event: "goal-set",
      creator: caller,
      amount: amount,
      description: description,
      deadline: deadline
    })
    (ok true)
  )
)

;; Deactivate current goal
(define-public (deactivate-goal)
  (let (
    (caller tx-sender)
    (goal-data (unwrap! (map-get? creator-goals caller) ERR_GOAL_NOT_FOUND))
  )
    (map-set creator-goals caller (merge goal-data {
      goal-active: false
    }))
    (print {
      event: "goal-deactivated",
      creator: caller
    })
    (ok true)
  )
)

;; Set custom preset tip amounts
(define-public (set-presets (p1 uint) (p2 uint) (p3 uint) (p4 uint) (p5 uint))
  (let ((caller tx-sender))
    ;; Verify caller is a registered creator
    (asserts! (is-some (map-get? creators caller)) ERR_CREATOR_NOT_FOUND)
    ;; Validate all presets are > 0
    (asserts! (and (> p1 u0) (> p2 u0) (> p3 u0) (> p4 u0) (> p5 u0)) ERR_INVALID_PRESET)
    ;; Set presets
    (map-set creator-presets caller {
      preset-1: p1,
      preset-2: p2,
      preset-3: p3,
      preset-4: p4,
      preset-5: p5
    })
    (print {
      event: "presets-updated",
      creator: caller,
      presets: (list p1 p2 p3 p4 p5)
    })
    (ok true)
  )
)

;; Send a tip to a creator using sBTC
;; Tips go DIRECTLY to creator (non-custodial - safer!)
(define-public (send-tip (creator principal) (amount uint) (message (string-utf8 280)))
  (let (
    (tipper tx-sender)
    (tip-id (+ (var-get tip-counter) u1))
    (creator-data (unwrap! (map-get? creators creator) ERR_CREATOR_NOT_FOUND))
    (creator-tip-index (get tip-count creator-data))
    (tipper-tip-index (default-to u0 (map-get? tipper-tip-counts tipper)))
  )
    ;; Validate amount
    (asserts! (>= amount MIN_TIP_AMOUNT) ERR_INVALID_AMOUNT)
    ;; Transfer sBTC directly from tipper to creator (non-custodial)
    ;; Note: contract-call? requires literal principal, Clarinet remaps per network
    (unwrap! (contract-call? 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token transfer
      amount
      tipper
      creator
      none
    ) ERR_TRANSFER_FAILED)
    ;; Update creator stats
    (map-set creators creator (merge creator-data {
      total-received: (+ (get total-received creator-data) amount),
      tip-count: (+ (get tip-count creator-data) u1)
    }))
    ;; Record the tip
    (map-set tips tip-id {
      from: tipper,
      to: creator,
      amount: amount,
      message: message,
      timestamp: burn-block-height
    })
    ;; Index tip for creator history
    (map-set creator-tip-ids { creator: creator, index: creator-tip-index } tip-id)
    ;; Index tip for tipper history
    (map-set tipper-tip-ids { tipper: tipper, index: tipper-tip-index } tip-id)
    (map-set tipper-tip-counts tipper (+ tipper-tip-index u1))
    ;; Update counters
    (var-set tip-counter tip-id)
    (var-set total-tips-processed (+ (var-get total-tips-processed) amount))
    ;; Emit event
    (print {
      event: "tip-sent",
      tip-id: tip-id,
      from: tipper,
      to: creator,
      amount: amount,
      message: message,
      block: burn-block-height
    })
    (ok tip-id)
  )
)

;; =====================================
;; READ-ONLY FUNCTIONS
;; =====================================

;; Get creator profile
(define-read-only (get-creator (creator principal))
  (map-get? creators creator)
)

;; Get creator's goal/campaign
(define-read-only (get-creator-goal (creator principal))
  (map-get? creator-goals creator)
)

;; Get goal progress (amount raised toward goal)
(define-read-only (get-goal-progress (creator principal))
  (let (
    (creator-data (map-get? creators creator))
    (goal-data (map-get? creator-goals creator))
  )
    (match creator-data
      c-data (match goal-data
        g-data (some {
          goal-amount: (get goal-amount g-data),
          raised: (get total-received c-data),
          remaining: (if (>= (get total-received c-data) (get goal-amount g-data))
                      u0
                      (- (get goal-amount g-data) (get total-received c-data))),
          percentage: (/ (* (get total-received c-data) u100) (get goal-amount g-data)),
          active: (get goal-active g-data)
        })
        none
      )
      none
    )
  )
)

;; Get creator's preset tip amounts
(define-read-only (get-creator-presets (creator principal))
  (map-get? creator-presets creator)
)

;; Get tip details by ID
(define-read-only (get-tip (tip-id uint))
  (map-get? tips tip-id)
)

;; Get tip ID from creator's history by index
(define-read-only (get-creator-tip-at-index (creator principal) (index uint))
  (map-get? creator-tip-ids { creator: creator, index: index })
)

;; Get tip ID from tipper's history by index
(define-read-only (get-tipper-tip-at-index (tipper principal) (index uint))
  (map-get? tipper-tip-ids { tipper: tipper, index: index })
)

;; Get tip count for a specific tipper
(define-read-only (get-tipper-tip-count (tipper principal))
  (default-to u0 (map-get? tipper-tip-counts tipper))
)

;; Get total tips processed
(define-read-only (get-total-tips-processed)
  (var-get total-tips-processed)
)

;; Get total creators registered
(define-read-only (get-total-creators)
  (var-get total-creators)
)

;; Get current tip counter (total tips sent)
(define-read-only (get-tip-count)
  (var-get tip-counter)
)

;; Check if a principal is a registered creator
(define-read-only (is-creator (principal principal))
  (is-some (map-get? creators principal))
)

;; Get recent tips (returns tip ID at given position from end)
;; Index 0 = most recent, 1 = second most recent, etc.
(define-read-only (get-recent-tip-id (index uint))
  (let ((total (var-get tip-counter)))
    (if (> total index)
      (some (- total index))
      none
    )
  )
)
