import { useState } from 'react';
import { User, Mail, Phone, CheckCircle2, Activity, Send, ChevronDown } from 'lucide-react';

export const LeadCaptureModal = ({ initialInterest }: { initialInterest?: string }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: initialInterest || 'general',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Using Secure Token (Authorized by user)
      const response = await fetch('https://formsubmit.co/ajax/3f2f544e1402d95130017c1f71354bdc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `✨ Nueva Solicitud: ${formData.name}`,
          _template: 'box',
          _captcha: 'false',
          _autoresponse:
            '¡Gracias por contactar con Activa S.L.! Hemos recibido tu solicitud.',
          // Spanish Data Labels
          'Nombre del Paciente': formData.name,
          'Email de Contacto': formData.email,
          Teléfono: formData.phone || 'No indicado',
          'Interés Principal': formData.interest,
          'Mensaje Automático': `El usuario ha solicitado información sobre: ${formData.interest}. Por favor contactar a la brevedad.`,
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        alert('Hubo un error al enviar el formulario. Por favor intenta contactar por teléfono.');
      }
    } catch (error) {
      console.error('Error sending form:', error);
      alert('Error de conexión. Por favor verifica tu internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-12 px-6 animate-fade-in font-['Inter']">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="text-green-500 w-12 h-12" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 font-['Outfit']">
          ¡Gracias por registrarte!
        </h3>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
          Hemos recibido tus datos correctamente. En breves momentos nos pondremos en contacto
          contigo para resolver tus dudas.
        </p>
        <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700">
          <p className="font-bold">✓ Registro Completado</p>
          <p>Tu solicitud ha sido enviada al equipo de admisión.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 font-['Inter']">
      {/* Header / Incentive */}
      <div className="bg-slate-50 p-8 border-b border-gray-100 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC008C]/10 border border-[#EC008C]/20 text-[#EC008C] text-xs font-bold tracking-widest uppercase mb-6">
          <Activity size={14} /> Solicitud 2026
        </div>
        <h3 className="text-3xl font-bold text-slate-900 font-['Outfit'] mb-3 leading-tight">
          Tu Espacio Terapéutico
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          Facilítanos tu contacto para enviarte nuestra <strong>propuesta clínica</strong> y{' '}
          <strong>disponibilidad de horarios</strong>. Sin compromiso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div className="space-y-4">
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EC008C] transition-colors"
              size={20}
            />
            <input
              required
              type="text"
              placeholder="Nombre Completo"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#EC008C] focus:ring-4 focus:ring-[#EC008C]/5 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Mail
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${formData.email.includes('@') ? 'text-[#EC008C]' : 'text-slate-400 group-focus-within:text-[#EC008C]'}`}
              size={20}
            />
            <input
              required
              type="email"
              placeholder="Correo Electrónico"
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#EC008C] focus:ring-4 focus:ring-[#EC008C]/5 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {/* Premium Validation Indicator */}
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-500 ${formData.email.includes('@') && formData.email.length > 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            >
              <CheckCircle2 className="text-green-500" size={20} />
            </div>
          </div>

          <div className="relative group">
            <Phone
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EC008C] transition-colors"
              size={20}
            />
            <input
              type="tel"
              placeholder="Teléfono (Opcional)"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#EC008C] focus:ring-4 focus:ring-[#EC008C]/5 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Activity
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EC008C] transition-colors"
              size={20}
            />
            <select
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#EC008C] focus:ring-4 focus:ring-[#EC008C]/5 outline-none transition-all font-medium text-slate-700 appearance-none shadow-sm hover:border-slate-300"
              value={formData.interest}
              onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
            >
              <option value="general">Información General</option>
              <option value="individual">Sesiones Individuales</option>
              <option value="grupal">Sesiones Grupales</option>
              <option value="online">Terapia Online</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#0A0F1D] text-white py-5 rounded-2xl font-['Outfit'] font-bold hover:bg-[#EC008C] transition-all shadow-xl hover:shadow-[#EC008C]/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'ENVIANDO...' : 'SOLICITAR INFORMACIÓN'}{' '}
            <Send size={20} className={isSubmitting ? 'animate-pulse' : ''} />
          </button>
          <p className="text-center text-xs text-slate-400 mt-4">
            Tus datos se gestionan de forma segura según la normativa RGPD.
          </p>
        </div>
      </form>
    </div>
  );
};
