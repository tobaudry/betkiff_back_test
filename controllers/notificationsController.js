const admin = require("../Config/Firebase");
const db = admin.database();
const messaging = admin.messaging();

/**
 * Envoie une notification push à un utilisateur spécifique.
 */
const sendNotificationToUser = async (req, res) => {
  const { title, body, userId, idOrganisation } = req.body;

  if (!title || !body || !userId || !idOrganisation) {
    return res
      .status(400)
      .json({ error: "Titre, message, userId et idOrganisation requis" });
  }

  try {
    // Récupérer le token FCM de l'utilisateur
    const snapshot = await db
      .ref(`organisations/${idOrganisation}/users/${userId}/fcmToken`)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Token FCM introuvable." });
    }

    const token = snapshot.val();

    const message = {
      notification: { title, body },
      token,
    };

    const response = await messaging.send(message);
    res.json({ success: "Notification envoyée !", response });
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de la notification." });
  }
};

const sendNotificationToOrganization = async (req, res) => {
  const { title, body, idOrganisation } = req.body;

  if (!title || !body || !idOrganisation) {
    return res.status(400).json({ error: "Titre, message et idOrganisation requis" });
  }

  try {
    const snapshot = await db
      .ref(`organisations/${idOrganisation}/users`)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Aucun utilisateur trouvé." });
    }

    // Récupérer tous les tokens FCM
    const tokens = Object.values(snapshot.val())
      .map((user) => user.fcmToken)
      .filter((token) => token); // Filtrer les valeurs vides

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Aucun utilisateur avec un token FCM." });
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    res.json({ success: "Notifications envoyées à l'organisation !", response });
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    res.status(500).json({ error: "Erreur lors de l'envoi des notifications" });
  }
};

module.exports = { sendNotificationToUser, sendNotificationToOrganization };

