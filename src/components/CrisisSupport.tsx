import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, MessageCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const CrisisSupport = ({ show = false }: { show?: boolean }) => {
  const { t } = useTranslation();
  
  if (!show) return null;

  const crisisResources = [
    {
      name: "SADAG (South African Depression and Anxiety Group)",
      phone: "0800 567 567",
      hours: "8am - 8pm, 7 days a week",
      type: "call",
    },
    {
      name: "Lifeline South Africa",
      phone: "0861 322 322",
      hours: "24/7",
      type: "call",
    },
    {
      name: "Suicide Crisis Line",
      phone: "0800 567 567",
      sms: "31393",
      hours: "24/7",
      type: "emergency",
    },
    {
      name: "Discovery Health Mental Health Line",
      phone: "0860 999 911",
      hours: "24/7 for Discovery members",
      type: "call",
    },
  ];

  return (
    <Card className="p-6 border-2 border-red-200 bg-red-50 dark:bg-red-900/10">
      <Alert className="mb-4 border-red-300 bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
          {t('crisis.not_alone')}
        </AlertDescription>
      </Alert>

      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {t('crisis.immediate_support')}
      </h3>

      <div className="space-y-4">
        {crisisResources.map((resource, idx) => (
          <div
            key={idx}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {resource.name}
              </h4>
              {resource.type === "emergency" && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  {t('crisis.emergency')}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <a
                href={`tel:${resource.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Phone className="w-4 h-4" />
                {resource.phone}
              </a>
              
              {resource.sms && (
                <a
                  href={`sms:${resource.sms}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  SMS: {resource.sms}
                </a>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resource.hours}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
          {t('crisis.medical_emergency')}
        </h4>
        <div className="space-y-2">
          <Button
            size="lg"
            variant="destructive"
            className="w-full gap-2"
            onClick={() => window.location.href = "tel:10177"}
          >
            <Phone className="w-5 h-5" />
            {t('crisis.call_emergency')}: 10177
          </Button>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {t('crisis.nearest_hospital')}
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Discovery Health Mental Wellness
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          As a Discovery member, you have access to:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
          <li>8 free counseling sessions per year</li>
          <li>24/7 mental health crisis line</li>
          <li>Online therapy via Discovery app</li>
          <li>Psychiatric care covered by your plan</li>
        </ul>
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={() => window.open("https://www.discovery.co.za/portal/", "_blank")}
        >
          Access Discovery Portal
        </Button>
      </div>
    </Card>
  );
};
