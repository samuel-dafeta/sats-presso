;; sbt-badges.clar
;; Soul-Bound Token (SBT) Badges for Sats-Presso
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