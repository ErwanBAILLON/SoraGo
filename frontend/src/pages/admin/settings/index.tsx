import React, { useState } from 'react';
import { NextPage } from 'next';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { 
  FiSave, FiAlertCircle, FiCreditCard, FiMail,
  FiGlobe, FiCalendar
} from 'react-icons/fi';

const SettingsPage: NextPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'SoraGo',
    companyName: 'SoraGo SAS',
    contactEmail: 'contact@sorago.com',
    supportEmail: 'support@sorago.com',
    phoneNumber: '+33 1 23 45 67 89',
    language: 'fr',
    timezone: 'Europe/Paris',
    currency: 'EUR'
  });

  const [bookingSettings, setBookingSettings] = useState({
    minReservationDuration: 1,
    maxReservationDuration: 30,
    advanceBookingDays: 90,
    startTimeOptions: '08:00,10:00,12:00,14:00,16:00,18:00',
    endTimeOptions: '08:00,10:00,12:00,14:00,16:00,18:00',
    allowSameDay: true,
    requireVerification: true
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    stripePublicKey: 'pk_test_xxxxxxxxxxxxx',
    stripeSecretKey: '••••••••••••••••••••••',
    paypalEnabled: false,
    paypalClientId: '',
    paypalSecret: '',
    vatRate: 20,
    depositPercentage: 30,
    allowPartialPayment: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: 'notifications@sorago.com',
    smtpPassword: '••••••••••••••',
    senderName: 'SoraGo Notifications',
    senderEmail: 'no-reply@sorago.com',
    useTemplates: true,
    bookingConfirmationTemplate: 'booking_confirmation',
    bookingCancellationTemplate: 'booking_cancellation'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setBookingSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPaymentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      setError('Une erreur est survenue lors de la sauvegarde des paramètres.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">Configurez les paramètres globaux de la plateforme</p>
      </MotionDiv>

      {success && (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FiSave className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Les paramètres ont été enregistrés avec succès.
              </p>
            </div>
          </div>
        </MotionDiv>
      )}

      {error && (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </MotionDiv>
      )}

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 border-b border-border"
      >
        <div className="flex space-x-6 overflow-x-auto">
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'general' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('general')}
          >
            <div className="flex items-center space-x-2">
              <FiGlobe className="h-4 w-4" />
              <span>Général</span>
            </div>
          </button>
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'booking' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('booking')}
          >
            <div className="flex items-center space-x-2">
              <FiCalendar className="h-4 w-4" />
              <span>Réservations</span>
            </div>
          </button>
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'payment' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('payment')}
          >
            <div className="flex items-center space-x-2">
              <FiCreditCard className="h-4 w-4" />
              <span>Paiements</span>
            </div>
          </button>
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'email' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('email')}
          >
            <div className="flex items-center space-x-2">
              <FiMail className="h-4 w-4" />
              <span>Email</span>
            </div>
          </button>
        </div>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSaveSettings}>
          {activeTab === 'general' && (
            <div className="bg-card p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <FiGlobe className="mr-2 h-5 w-5" />
                Paramètres généraux
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-foreground mb-1">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1">
                    Nom de l&apos;entreprise
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={generalSettings.companyName}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="supportEmail" className="block text-sm font-medium text-foreground mb-1">
                    Email de support
                  </label>
                  <input
                    type="email"
                    id="supportEmail"
                    name="supportEmail"
                    value={generalSettings.supportEmail}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={generalSettings.phoneNumber}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-foreground mb-1">
                    Langue par défaut
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={generalSettings.language}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-1">
                    Fuseau horaire
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={generalSettings.timezone}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-1">
                    Devise
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={generalSettings.currency}
                    onChange={handleGeneralSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="bg-card p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <FiCalendar className="mr-2 h-5 w-5" />
                Paramètres de réservation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minReservationDuration" className="block text-sm font-medium text-foreground mb-1">
                    Durée minimale de réservation (jours)
                  </label>
                  <input
                    type="number"
                    id="minReservationDuration"
                    name="minReservationDuration"
                    value={bookingSettings.minReservationDuration}
                    onChange={handleBookingSettingsChange}
                    min="1"
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="maxReservationDuration" className="block text-sm font-medium text-foreground mb-1">
                    Durée maximale de réservation (jours)
                  </label>
                  <input
                    type="number"
                    id="maxReservationDuration"
                    name="maxReservationDuration"
                    value={bookingSettings.maxReservationDuration}
                    onChange={handleBookingSettingsChange}
                    min="1"
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="advanceBookingDays" className="block text-sm font-medium text-foreground mb-1">
                    Jours de réservation à l&apos;avance
                  </label>
                  <input
                    type="number"
                    id="advanceBookingDays"
                    name="advanceBookingDays"
                    value={bookingSettings.advanceBookingDays}
                    onChange={handleBookingSettingsChange}
                    min="1"
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="startTimeOptions" className="block text-sm font-medium text-foreground mb-1">
                    Options d&apos;heures de début (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    id="startTimeOptions"
                    name="startTimeOptions"
                    value={bookingSettings.startTimeOptions}
                    onChange={handleBookingSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="endTimeOptions" className="block text-sm font-medium text-foreground mb-1">
                    Options d&apos;heures de fin (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    id="endTimeOptions"
                    name="endTimeOptions"
                    value={bookingSettings.endTimeOptions}
                    onChange={handleBookingSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="col-span-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowSameDay"
                      name="allowSameDay"
                      checked={bookingSettings.allowSameDay}
                      onChange={handleBookingSettingsChange}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="allowSameDay" className="ml-2 block text-sm text-foreground">
                      Autoriser les réservations le jour même
                    </label>
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireVerification"
                      name="requireVerification"
                      checked={bookingSettings.requireVerification}
                      onChange={handleBookingSettingsChange}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="requireVerification" className="ml-2 block text-sm text-foreground">
                      Exiger la vérification d&apos;identité avant la réservation
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-card p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <FiCreditCard className="mr-2 h-5 w-5" />
                Paramètres de paiement
              </h2>
              
              <div className="border-b border-border pb-6 mb-6">
                <h3 className="text-md font-medium text-foreground mb-4">Stripe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="stripeEnabled"
                        name="stripeEnabled"
                        checked={paymentSettings.stripeEnabled}
                        onChange={handlePaymentSettingsChange}
                        className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <label htmlFor="stripeEnabled" className="ml-2 block text-sm text-foreground">
                        Activer les paiements Stripe
                      </label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="stripePublicKey" className="block text-sm font-medium text-foreground mb-1">
                      Clé publique Stripe
                    </label>
                    <input
                      type="text"
                      id="stripePublicKey"
                      name="stripePublicKey"
                      value={paymentSettings.stripePublicKey}
                      onChange={handlePaymentSettingsChange}
                      disabled={!paymentSettings.stripeEnabled}
                      className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-foreground mb-1">
                      Clé secrète Stripe
                    </label>
                    <input
                      type="password"
                      id="stripeSecretKey"
                      name="stripeSecretKey"
                      value={paymentSettings.stripeSecretKey}
                      onChange={handlePaymentSettingsChange}
                      disabled={!paymentSettings.stripeEnabled}
                      className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-b border-border pb-6 mb-6">
                <h3 className="text-md font-medium text-foreground mb-4">PayPal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="paypalEnabled"
                        name="paypalEnabled"
                        checked={paymentSettings.paypalEnabled}
                        onChange={handlePaymentSettingsChange}
                        className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <label htmlFor="paypalEnabled" className="ml-2 block text-sm text-foreground">
                        Activer les paiements PayPal
                      </label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="paypalClientId" className="block text-sm font-medium text-foreground mb-1">
                      Client ID PayPal
                    </label>
                    <input
                      type="text"
                      id="paypalClientId"
                      name="paypalClientId"
                      value={paymentSettings.paypalClientId}
                      onChange={handlePaymentSettingsChange}
                      disabled={!paymentSettings.paypalEnabled}
                      className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="paypalSecret" className="block text-sm font-medium text-foreground mb-1">
                      Secret PayPal
                    </label>
                    <input
                      type="password"
                      id="paypalSecret"
                      name="paypalSecret"
                      value={paymentSettings.paypalSecret}
                      onChange={handlePaymentSettingsChange}
                      disabled={!paymentSettings.paypalEnabled}
                      className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-foreground mb-4">Paramètres généraux de paiement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="vatRate" className="block text-sm font-medium text-foreground mb-1">
                      Taux de TVA (%)
                    </label>
                    <input
                      type="number"
                      id="vatRate"
                      name="vatRate"
                      value={paymentSettings.vatRate}
                      onChange={handlePaymentSettingsChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="depositPercentage" className="block text-sm font-medium text-foreground mb-1">
                      Pourcentage de caution (%)
                    </label>
                    <input
                      type="number"
                      id="depositPercentage"
                      name="depositPercentage"
                      value={paymentSettings.depositPercentage}
                      onChange={handlePaymentSettingsChange}
                      min="0"
                      max="100"
                      className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="col-span-full">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowPartialPayment"
                        name="allowPartialPayment"
                        checked={paymentSettings.allowPartialPayment}
                        onChange={handlePaymentSettingsChange}
                        className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <label htmlFor="allowPartialPayment" className="ml-2 block text-sm text-foreground">
                        Autoriser les paiements partiels
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-card p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <FiMail className="mr-2 h-5 w-5" />
                Paramètres d&apos;email
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="smtpServer" className="block text-sm font-medium text-foreground mb-1">
                    Serveur SMTP
                  </label>
                  <input
                    type="text"
                    id="smtpServer"
                    name="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={handleEmailSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-foreground mb-1">
                    Port SMTP
                  </label>
                  <input
                    type="number"
                    id="smtpPort"
                    name="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="smtpUser" className="block text-sm font-medium text-foreground mb-1">
                    Utilisateur SMTP
                  </label>
                  <input
                    type="text"
                    id="smtpUser"
                    name="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={handleEmailSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-foreground mb-1">
                    Mot de passe SMTP
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    name="smtpPassword"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="senderName" className="block text-sm font-medium text-foreground mb-1">
                    Nom de l&apos;expéditeur
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={emailSettings.senderName}
                    onChange={handleEmailSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="senderEmail" className="block text-sm font-medium text-foreground mb-1">
                    Email de l&apos;expéditeur
                  </label>
                  <input
                    type="email"
                    id="senderEmail"
                    name="senderEmail"
                    value={emailSettings.senderEmail}
                    onChange={handleEmailSettingsChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="col-span-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useTemplates"
                      name="useTemplates"
                      checked={emailSettings.useTemplates}
                      onChange={handleEmailSettingsChange}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="useTemplates" className="ml-2 block text-sm text-foreground">
                      Utiliser des modèles d&apos;email
                    </label>
                  </div>
                </div>
                
                {emailSettings.useTemplates && (
                  <>
                    <div>
                      <label htmlFor="bookingConfirmationTemplate" className="block text-sm font-medium text-foreground mb-1">
                        Modèle de confirmation de réservation
                      </label>
                      <input
                        type="text"
                        id="bookingConfirmationTemplate"
                        name="bookingConfirmationTemplate"
                        value={emailSettings.bookingConfirmationTemplate}
                        onChange={handleEmailSettingsChange}
                        className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="bookingCancellationTemplate" className="block text-sm font-medium text-foreground mb-1">
                        Modèle d&apos;annulation de réservation
                      </label>
                      <input
                        type="text"
                        id="bookingCancellationTemplate"
                        name="bookingCancellationTemplate"
                        value={emailSettings.bookingCancellationTemplate}
                        onChange={handleEmailSettingsChange}
                        className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Tester la configuration d&apos;email
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-5 w-5" />
                  Enregistrer les paramètres
                </>
              )}
            </button>
          </div>
        </form>
      </MotionDiv>
    </AdminLayout>
  );
};

export default SettingsPage;