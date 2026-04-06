import styles from "./ProfileSection.module.css";

function ProfileSection({
  profileForm,
  profileFieldErrors,
  profileError,
  profileSuccess,
  isSavingProfile,
  currentAvatarUrl,
  isRemovingAvatar,
  handleProfileChange,
  handleProfileSubmit,
  handleRemoveAvatar,
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Mi perfil</h2>
          <p className={styles.infoText}>
            Actualiza tus datos básicos para mantener tu cuenta al día.
          </p>
        </div>
      </div>

      <form
        className={styles.formCard}
        onSubmit={handleProfileSubmit}
        noValidate
      >
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="profile-name">Nombre</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              value={profileForm.name}
              onChange={handleProfileChange}
              placeholder="Tu nombre completo"
            />
            {profileFieldErrors.name ? (
              <p className={styles.errorText}>{profileFieldErrors.name}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              placeholder="tuemail@ejemplo.com"
            />
            {profileFieldErrors.email ? (
              <p className={styles.errorText}>{profileFieldErrors.email}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-city">Ciudad</label>
            <input
              id="profile-city"
              name="city"
              type="text"
              value={profileForm.city}
              onChange={handleProfileChange}
              placeholder="Tu ciudad"
            />
            {profileFieldErrors.city ? (
              <p className={styles.errorText}>{profileFieldErrors.city}</p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-avatar">Avatar</label>

            <input
              id="profile-avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
            />

            {profileFieldErrors.avatar ? (
              <p className={styles.errorText}>{profileFieldErrors.avatar}</p>
            ) : null}
          </div>

          <div className={`${styles.field} ${styles.fullWidthField}`}>
            <label>Avatar actual</label>

            {currentAvatarUrl ? (
              <div className={styles.avatarCurrentRow}>
                <img
                  src={currentAvatarUrl}
                  alt="Avatar actual"
                  className={styles.avatarPreview}
                />

                <div className={styles.avatarActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleRemoveAvatar}
                    disabled={isSavingProfile || isRemovingAvatar}
                  >
                    {isRemovingAvatar ? "Eliminando..." : "Eliminar avatar"}
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.helperText}>
                No tienes avatar subido actualmente.
              </p>
            )}
          </div>
        </div>

        {profileError ? (
          <p className={styles.errorText}>{profileError}</p>
        ) : null}
        {profileSuccess ? (
          <p className={styles.successText}>{profileSuccess}</p>
        ) : null}

        <div className={styles.actionsRow}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSavingProfile || isRemovingAvatar}
          >
            {isSavingProfile ? "Guardando..." : "Guardar perfil"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfileSection;
