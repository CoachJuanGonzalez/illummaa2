// Enhanced Google Analytics 4 tracking for ILLÜMMAA
// Comprehensive tracking for navigation, assessment forms, and business events

// GA4 Event Types
interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface AssessmentEvent extends GAEvent {
  step_number?: number;
  step_name?: string;
  completion_percentage?: number;
  customer_tier?: string;
  unit_count?: string;
  readiness_level?: string;
  province?: string;
}

interface NavigationEvent extends GAEvent {
  section_name: string;
  navigation_type: 'header' | 'footer' | 'model' | 'scroll';
  page_location?: string;
}

interface BusinessEvent extends GAEvent {
  lead_type?: 'explorer' | 'residential' | 'partnership';
  partnership_tier?: string;
  build_canada_eligible?: boolean;
  government_programs?: string;
}

// Enhanced GA4 tracking utility class
class IllummaaAnalytics {
  private measurementId: string;
  private isProduction: boolean;

  constructor() {
    this.measurementId = 'G-VNLBCYGCRZ';
    this.isProduction = import.meta.env.PROD;
  }

  // Core tracking function
  private track(eventName: string, parameters: Record<string, any> = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
      // Add common parameters
      const enhancedParams = {
        ...parameters,
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language
      };

      // Track the event
      window.gtag('event', eventName, enhancedParams);

      // Console log in development
      if (!this.isProduction) {
        console.log('GA4 Event:', eventName, enhancedParams);
      }
    } else if (!this.isProduction) {
      console.warn('GA4 not loaded or gtag not available');
    }
  }

  // Navigation Tracking
  trackNavigation(event: NavigationEvent) {
    this.track('navigation_click', {
      event_category: event.category,
      action: event.action,
      section_name: event.section_name,
      navigation_type: event.navigation_type,
      click_text: event.label,
      page_section: event.section_name,
      ...event.custom_parameters
    });
  }

  // Header navigation tracking
  trackHeaderNavClick(sectionName: string, sectionId?: string) {
    this.trackNavigation({
      action: 'header_nav_click',
      category: 'Navigation',
      section_name: sectionName,
      navigation_type: 'header',
      label: sectionName,
      custom_parameters: {
        target_section_id: sectionId,
        navigation_method: 'scroll_to_section'
      }
    });
  }

  // Footer navigation tracking
  trackFooterNavClick(linkText: string, targetSection?: string) {
    this.trackNavigation({
      action: 'footer_nav_click',
      category: 'Navigation',
      section_name: linkText,
      navigation_type: 'footer',
      label: linkText,
      custom_parameters: {
        target_section: targetSection
      }
    });
  }

  // Model page navigation
  trackModelPageView(modelName: string, modelPath: string) {
    this.track('page_view', {
      event_category: 'Model Pages',
      model_name: modelName,
      model_path: modelPath,
      content_group1: 'Model Details'
    });
  }

  trackModelNavigation(modelName: string, sourceLocation: string) {
    this.track('model_navigation', {
      event_category: 'Model Navigation',
      model_name: modelName,
      source_location: sourceLocation,
      action: 'view_model_details'
    });
  }

  // Assessment Form Tracking
  trackAssessmentStart() {
    this.track('assessment_start', {
      event_category: 'Assessment Form',
      action: 'form_start',
      step_number: 1,
      step_name: 'readiness_selection'
    });
  }

  trackAssessmentStepComplete(stepNumber: number, stepName: string, formData: any = {}) {
    const completionPercentage = Math.round((stepNumber / 5) * 100);
    
    this.track('assessment_step_complete', {
      event_category: 'Assessment Form',
      action: 'step_complete',
      step_number: stepNumber,
      step_name: stepName,
      completion_percentage: completionPercentage,
      readiness_level: formData.readiness,
      unit_count: formData.unitCount,
      customer_tier: formData.customerTier,
      province: formData.province
    });
  }

  trackAssessmentStepStart(stepNumber: number, stepName: string) {
    this.track('assessment_step_start', {
      event_category: 'Assessment Form',
      action: 'step_start',
      step_number: stepNumber,
      step_name: stepName
    });
  }

  trackAssessmentAbandonment(stepNumber: number, stepName: string, timeSpent: number) {
    this.track('assessment_abandonment', {
      event_category: 'Assessment Form',
      action: 'form_abandonment',
      step_number: stepNumber,
      step_name: stepName,
      abandonment_point: stepName,
      time_spent_seconds: timeSpent,
      completion_percentage: Math.round((stepNumber / 5) * 100)
    });
  }

  // Assessment completion and conversion tracking
  trackAssessmentComplete(formData: any, priorityScore: number, customerTier: string) {
    this.track('assessment_complete', {
      event_category: 'Assessment Form',
      action: 'form_complete',
      step_number: 5,
      step_name: 'submission_success',
      completion_percentage: 100,
      priority_score: priorityScore,
      customer_tier: customerTier,
      readiness_level: formData.readiness,
      unit_count: formData.unitCount,
      budget_range: formData.budget,
      timeline: formData.timeline,
      province: formData.province,
      lead_type: this.determinLeadType(formData),
      partnership_tier: this.determinePartnershipTier(formData)
    });

    // Also track as conversion
    this.trackConversion('assessment_submission', {
      value: priorityScore,
      currency: 'CAD',
      customer_tier: customerTier,
      lead_quality: this.getLeadQuality(priorityScore)
    });
  }

  // Business Events Tracking
  trackCustomerTierDetermination(tier: string, unitCount: string, readiness: string) {
    this.track('customer_tier_determination', {
      event_category: 'Business Logic',
      action: 'tier_classification',
      customer_tier: tier,
      unit_count: unitCount,
      readiness_level: readiness,
      lead_type: this.determinLeadType({ readiness, unitCount })
    });
  }

  trackUnitCountSelection(unitCount: string, previousValue?: string) {
    this.track('unit_count_selection', {
      event_category: 'Assessment Input',
      action: 'unit_count_change',
      unit_count: unitCount,
      previous_value: previousValue,
      unit_range: this.getUnitRange(unitCount)
    });
  }

  trackReadinessSelection(readiness: string, previousValue?: string) {
    this.track('readiness_selection', {
      event_category: 'Assessment Input',
      action: 'readiness_change',
      readiness_level: readiness,
      previous_value: previousValue,
      lead_type: this.determinLeadType({ readiness })
    });
  }

  trackProvinceSelection(province: string) {
    this.track('province_selection', {
      event_category: 'Assessment Input',
      action: 'province_selection',
      province: province,
      region: this.getCanadianRegion(province)
    });
  }

  // Conversion and Goal Tracking
  trackConversion(conversionName: string, parameters: Record<string, any> = {}) {
    this.track('conversion', {
      event_category: 'Conversions',
      action: conversionName,
      ...parameters
    });
  }

  trackLeadGeneration(leadData: any) {
    this.track('generate_lead', {
      event_category: 'Lead Generation',
      action: 'qualified_lead_generated',
      customer_tier: leadData.customerTier,
      priority_score: leadData.priorityScore,
      lead_type: this.determinLeadType(leadData),
      unit_count: leadData.unitCount,
      province: leadData.province,
      value: leadData.priorityScore,
      currency: 'CAD'
    });
  }

  // Single Page App (SPA) Route Tracking
  trackRouteChange(newPath: string, previousPath?: string) {
    this.track('page_view', {
      page_path: newPath,
      page_title: document.title,
      page_location: window.location.href,
      previous_page_path: previousPath,
      navigation_type: 'spa_route_change'
    });
  }

  // Scroll tracking for section visibility
  trackSectionView(sectionId: string, sectionName: string) {
    this.track('section_view', {
      event_category: 'Page Engagement',
      action: 'section_viewed',
      section_id: sectionId,
      section_name: sectionName,
      scroll_depth: this.getScrollDepth()
    });
  }

  // Enhanced engagement tracking
  trackTimeOnPage(timeSpent: number, pageDepth: number) {
    this.track('engagement_time', {
      event_category: 'Page Engagement',
      action: 'time_on_page',
      engagement_time_msec: timeSpent,
      page_depth: pageDepth,
      scroll_depth: this.getScrollDepth()
    });
  }

  // Helper methods
  private determinLeadType(formData: any): string {
    if (!formData.readiness) return 'unknown';
    
    if (formData.readiness === 'researching') return 'explorer';
    
    const unitCount = parseInt(formData.unitCount) || 0;
    if (unitCount < 50) return 'residential';
    return 'partnership';
  }

  private determinePartnershipTier(formData: any): string {
    const unitCount = parseInt(formData.unitCount) || 0;
    
    if (unitCount >= 300) return 'Elite';
    if (unitCount >= 150) return 'Preferred';
    if (unitCount >= 50) return 'Pioneer';
    if (unitCount >= 3) return 'Starter';
    return 'Individual';
  }

  // Public helper methods for external use
  public getLeadType(formData: any): string {
    return this.determinLeadType(formData);
  }

  public getPartnershipTier(formData: any): string {
    return this.determinePartnershipTier(formData);
  }

  private getLeadQuality(priorityScore: number): string {
    if (priorityScore >= 100) return 'high';
    if (priorityScore >= 70) return 'medium';
    if (priorityScore >= 40) return 'low';
    return 'very_low';
  }

  private getUnitRange(unitCount: string): string {
    const count = parseInt(unitCount) || 0;
    if (count >= 300) return '300+';
    if (count >= 150) return '150-299';
    if (count >= 50) return '50-149';
    if (count >= 3) return '3-49';
    if (count >= 1) return '1-2';
    return '0';
  }

  private getCanadianRegion(province: string): string {
    const regions: Record<string, string> = {
      'ontario': 'Central',
      'quebec': 'Central',
      'british-columbia': 'West',
      'alberta': 'West',
      'saskatchewan': 'West',
      'manitoba': 'West',
      'nova-scotia': 'Atlantic',
      'new-brunswick': 'Atlantic',
      'newfoundland': 'Atlantic',
      'prince-edward-island': 'Atlantic',
      'northwest-territories': 'North',
      'nunavut': 'North',
      'yukon': 'North'
    };
    return regions[province] || 'Unknown';
  }

  private getScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return Math.round((scrollTop / docHeight) * 100);
  }
}

// Use existing gtag types from the environment

// Export singleton instance
export const analytics = new IllummaaAnalytics();

// Convenience functions
export const trackNavigation = analytics.trackNavigation.bind(analytics);
export const trackHeaderNavClick = analytics.trackHeaderNavClick.bind(analytics);
export const trackFooterNavClick = analytics.trackFooterNavClick.bind(analytics);
export const trackModelPageView = analytics.trackModelPageView.bind(analytics);
export const trackAssessmentStart = analytics.trackAssessmentStart.bind(analytics);
export const trackAssessmentStepComplete = analytics.trackAssessmentStepComplete.bind(analytics);
export const trackAssessmentComplete = analytics.trackAssessmentComplete.bind(analytics);
export const trackCustomerTierDetermination = analytics.trackCustomerTierDetermination.bind(analytics);
export const trackUnitCountSelection = analytics.trackUnitCountSelection.bind(analytics);
export const trackRouteChange = analytics.trackRouteChange.bind(analytics);
export const trackSectionView = analytics.trackSectionView.bind(analytics);

export default analytics;