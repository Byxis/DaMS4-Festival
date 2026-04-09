package fr.ayae.festivals.data.login

/**
 * Enum representing all possible user roles in the application.
 * Mirrors the backend roles: admin, editor, publisher, guest.
 */
enum class UserRole {
    ADMIN,
    EDITOR,
    PUBLISHER,
    GUEST,
    UNKNOWN;

    companion object {
        fun fromString(role: String?): UserRole = when (role?.lowercase()) {
            "admin", "administrateur"     -> ADMIN
            "editor", "editeur", "éditeur" -> EDITOR
            "publisher", "editeur de jeu", "éditeur de jeu" -> PUBLISHER
            "guest", "invité"             -> GUEST
            else                          -> UNKNOWN
        }
    }

    // --- Permission helpers ---

    /** Profile not yet loaded — show a spinner, not an error screen. */
    val isUnresolved: Boolean get() = this == UNKNOWN

    /** Can view the festival list and festival details. */
    val canViewFestivals: Boolean get() = this == ADMIN || this == EDITOR || this == PUBLISHER

    /** Can view ALL reservations (not just their own). */
    val canViewAllReservations: Boolean get() = this == ADMIN || this == EDITOR

    /** Can modify festivals, zones, reservations, etc. */
    val canEdit: Boolean get() = this == ADMIN || this == EDITOR

    /** Can view the Zones tab of a festival. */
    val canViewZones: Boolean get() = this == ADMIN || this == EDITOR || this == PUBLISHER

    /** Can access the Publisher screens. */
    val canViewPublishers: Boolean get() = this == ADMIN || this == EDITOR

    /** Can access the Administration screen. */
    val canViewAdmin: Boolean get() = this == ADMIN

    /** Account is pending admin approval — user sees a blocking screen. Only GUEST, not UNKNOWN. */
    val isGuest: Boolean get() = this == GUEST

    /** Check if the user is a Publisher. */
    val isPublisher: Boolean get() = this == PUBLISHER
}
