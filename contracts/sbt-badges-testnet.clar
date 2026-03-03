;; sbt-badges-testnet.clar
;; Soul-Bound Token (SBT) Badges for Sats-Presso - TESTNET VERSION
;; Non-transferable achievement badges

;; ============================================================
;; CONSTANTS
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-CLAIMED (err u409))
(define-constant ERR-NOT-ELIGIBLE (err u403))
(define-constant ERR-TRANSFER-BLOCKED (err u405))
(define-constant ERR-INVALID-BADGE (err u400))

;; Badge Type IDs
(define-constant BADGE-FIRST-SIP u1)       ;; First tip sent
(define-constant BADGE-REGULAR u2)         ;; 10+ tips sent
(define-constant BADGE-CONNOISSEUR u3)     ;; 100+ tips sent
(define-constant BADGE-WHALE u4)           ;; 1M+ sats tipped
(define-constant BADGE-STREAK-7 u5)        ;; 7-day tip streak
(define-constant BADGE-STREAK-30 u6)       ;; 30-day tip streak
(define-constant BADGE-TOP-SUPPORTER u7)   ;; #1 supporter of any creator
(define-constant BADGE-BATTLE-VICTOR u8)   ;; Won a tip battle
(define-constant BADGE-EARLY-ADOPTER u9)   ;; First 1000 users
(define-constant BADGE-DIAMOND-HANDS u10)  ;; 10+ diamond tier tips

;; Badge requirements
(define-constant REQ-REGULAR-TIPS u10)
(define-constant REQ-CONNOISSEUR-TIPS u100)
(define-constant REQ-WHALE-SATS u1000000)
(define-constant REQ-DIAMOND-TIPS u10)

;; ============================================================
;; DATA VARIABLES
;; ============================================================

(define-data-var last-badge-id uint u0)
(define-data-var total-users uint u0)
(define-data-var early-adopter-limit uint u1000)
(define-data-var base-uri (string-ascii 256) "https://satspresso.io/api/testnet/badge/")

;; ============================================================
;; DATA MAPS
;; ============================================================

;; SBT - Non-fungible but non-transferable
(define-non-fungible-token sbt-badge uint)

;; Badge metadata
(define-map badge-metadata uint {
  badge-type: uint,
  owner: principal,
  earned-at: uint,
  description: (string-utf8 100)
})