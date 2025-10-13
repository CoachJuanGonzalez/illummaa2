# 🔧 MAINTENANCE GUIDELINES

**ILLUMMAA Modular Homes Website**
**Version:** 1.0
**Last Updated:** October 3, 2025

---

## 🎯 MAINTENANCE PHILOSOPHY

**Golden Rule:** *"If it ain't broke, don't fix it"* ✨

The ILLUMMAA system is production-ready at 95/100 health score. This guide ensures you maintain that excellence without introducing unnecessary risks.

---

## 📅 MAINTENANCE SCHEDULE

### Daily Tasks (5 minutes)

**Automated Monitoring:**
```bash
# Check application health
curl https://your-domain.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","environment":"production"}
```

**What to Monitor:**
- Server uptime (target: 99.9%)
- Error logs (target: <10 errors/day)
- Form submissions (verify GoHighLevel delivery)

**Action Required:** ⚪ Only if errors detected

---

### Weekly Tasks (15 minutes)

**1. Log Review**
```bash
# Check error logs
tail -100 logs/error.log

# Check webhook logs
tail -100 logs/webhook.log

# Look for patterns, not individual errors
```

**2. Performance Check**
```bash
# Run health check
npm run check

# Expected: 0 TypeScript errors
```

**3. Dependency Security**
```bash
# Check for critical vulnerabilities only
npm audit --audit-level=high

# Only fix CRITICAL/HIGH severity issues
```

**Action Required:** 🟡 Fix critical issues only

---

### Monthly Tasks (30 minutes)

**1. Security Updates**
```bash
# Update dependencies (security patches only)
npm audit fix --only=prod

# Run type check
npm run check

# Rebuild to verify
npm run build
```

**2. Backup Verification**
```bash
# Verify database backups (if applicable)
# Test restore procedure (quarterly)
# Verify .env file is backed up securely
```

**3. Analytics Review** (if GA is active)
- Form completion rate
- Bounce rate
- Mobile vs Desktop traffic
- Browser compatibility issues

**Action Required:** 🟡 Address trends, not individual incidents

---

### Quarterly Tasks (2 hours)

**1. Comprehensive Testing**
```bash
# Full TypeScript check
npm run check

# Build verification
npm run build

# Manual testing:
# - Submit test assessment form
# - Verify mobile responsiveness
# - Check all navigation links
# - Test on multiple browsers
```

**2. Documentation Review**
- [ ] Update this maintenance guide
- [ ] Review QA test report
- [ ] Update risk assessment
- [ ] Refresh production checklist

**3. Performance Audit**
```bash
# Check bundle size
ls -lh dist/assets/*.js

# Analyze build output
npm run build -- --stats

# Review Core Web Vitals (if monitoring tools available)
```

**4. Legal Compliance Check**
- [ ] CASL requirements still met
- [ ] PIPEDA privacy policy current
- [ ] SMS consent mechanisms working
- [ ] Audit trail logging active

**Action Required:** 🟡 Plan improvements, execute carefully

---

## 🚨 REACTIVE MAINTENANCE

### When Users Report Issues

**Step 1: Triage (5 minutes)**

**Severity Classification:**

| Severity | Definition | Response Time | Example |
|----------|------------|---------------|---------|
| 🔴 Critical | Site down, security breach | Immediate (<15 min) | 500 errors, data breach |
| 🟠 High | Major feature broken | <1 hour | Form won't submit |
| 🟡 Medium | Minor feature broken | <4 hours | Link doesn't work |
| 🟢 Low | Cosmetic issue | <24 hours | Typo, color issue |

**Step 2: Investigation**

```bash
# Check logs for user's timeframe
grep "ERROR" logs/application.log | grep "[timestamp-range]"

# Check specific user's submission
grep "[user-email]" logs/submission.log

# Review webhook delivery
grep "[submission-id]" logs/webhook.log
```

**Step 3: Fix Strategy**

**CRITICAL (🔴): Immediate Rollback**
```bash
# Stop current version
pm2 stop illummaa

# Rollback to last stable
git checkout [last-stable-tag]
npm run build
pm2 start illummaa

# Notify stakeholders
# Plan permanent fix separately
```

**HIGH (🟠): Hotfix Branch**
```bash
# Create hotfix branch
git checkout -b hotfix/[issue-description]

# Make minimal fix
# Test thoroughly
# Deploy when verified

# Merge back to main
git checkout main
git merge hotfix/[issue-description]
```

**MEDIUM/LOW (🟡🟢): Standard Process**
```bash
# Create feature branch
git checkout -b fix/[issue-description]

# Implement fix
# Add tests (if applicable)
# Review with team
# Deploy in next release window
```

---

## 🛠️ COMMON MAINTENANCE TASKS

### Task 1: Update Dependencies

**When to Do:**
- Monthly: Security patches only
- Quarterly: Minor version updates
- Annually: Major version updates (with testing)

**How to Do:**
```bash
# Check outdated packages
npm outdated

# Update security patches (safe)
npm audit fix --only=prod

# Update minor versions (test first)
npm update --save

# NEVER update major versions without testing
# Example: react@18 → react@19 requires full QA
```

**Rollback if issues:**
```bash
git checkout package.json package-lock.json
npm install
```

---

### Task 2: Database Maintenance (if applicable)

**Weekly:**
```sql
-- Check table sizes
SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name::regclass))
FROM information_schema.tables
WHERE table_schema = 'public';

-- Monitor query performance
EXPLAIN ANALYZE [slow-query];
```

**Monthly:**
```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE [database-name];
```

---

### Task 3: Log Rotation

**Setup (one-time):**
```bash
# /etc/logrotate.d/illummaa
/var/log/illummaa/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload illummaa
    endscript
}
```

**Verify:**
```bash
# Force rotation test
logrotate -f /etc/logrotate.d/illummaa

# Check rotated logs
ls -lh /var/log/illummaa/
```

---

### Task 4: SSL Certificate Renewal

**Auto-renewal with Let's Encrypt:**
```bash
# Verify auto-renewal
certbot renew --dry-run

# Check certificate expiry
openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

**Manual renewal (if needed):**
```bash
certbot renew --force-renewal
systemctl reload nginx  # or your web server
```

---

## 🔍 MONITORING & ALERTS

### Critical Metrics to Track

**Application Health:**
- Uptime (target: 99.9%)
- Response time (target: <500ms)
- Error rate (target: <1%)
- Memory usage (alert: >80%)
- CPU usage (alert: >70%)

**Business Metrics:**
- Form submissions/day
- Conversion rate (assessment completion)
- GoHighLevel webhook success rate (target: 100%)

**Security Metrics:**
- Failed login attempts (alert: >10/hour)
- Suspicious IP patterns
- CSRF token failures (alert: >5/hour)

---

### Recommended Monitoring Tools

**Free Options:**
```bash
# Server monitoring
htop          # Resource usage
pm2 monit     # Process monitoring
tail -f logs/error.log  # Real-time logs
```

**Paid Options (if budget allows):**
- New Relic: Application performance
- Datadog: Full-stack monitoring
- Sentry: Error tracking
- LogRocket: Session replay

---

## 🚫 WHAT NOT TO DO

### ❌ NEVER DO THESE:

1. **❌ Don't chase 100/100 score**
   - Current 95/100 is excellent
   - Risk of breaking > reward of perfection
   - Focus on real issues, not metrics

2. **❌ Don't refactor working code**
   - "Clean code" is subjective
   - Working code is precious
   - Refactor only when absolutely necessary

3. **❌ Don't update major dependencies without testing**
   - Major version updates = breaking changes
   - Always test in staging first
   - Have rollback plan ready

4. **❌ Don't deploy on Fridays**
   - Issues discovered over weekend
   - Support team unavailable
   - Deploy Monday-Thursday only

5. **❌ Don't make multiple changes at once**
   - Change one thing at a time
   - Easier to identify issues
   - Easier to rollback

6. **❌ Don't skip backups before changes**
   - Always backup before updates
   - Verify backup is restorable
   - Document rollback procedure

---

## ✅ BEST PRACTICES

### DO THESE:

1. **✅ Version Control Everything**
   ```bash
   # Tag releases
   git tag -a v1.0.0 -m "Production release 1.0.0"
   git push origin v1.0.0

   # Meaningful commit messages
   git commit -m "Fix: Assessment form submission timeout (issue #123)"
   ```

2. **✅ Document All Changes**
   ```markdown
   # CHANGELOG.md

   ## [1.0.1] - 2025-10-15
   ### Fixed
   - Assessment form timeout on slow connections
   - Mobile header z-index issue

   ### Changed
   - Updated libphonenumber-js to 1.12.24
   ```

3. **✅ Test Before Deploy**
   ```bash
   # Pre-deployment checklist
   npm run check        # TypeScript
   npm run build        # Build succeeds
   curl [staging]/api/health  # Health check
   # Manual form submission test
   # Browser compatibility spot check
   ```

4. **✅ Monitor After Deploy**
   ```bash
   # Post-deployment monitoring (first 24 hours)
   tail -f logs/error.log     # Watch for errors
   watch -n 60 'curl [url]/api/health'  # Health checks
   # Check form submissions in GoHighLevel
   ```

5. **✅ Keep Dependencies Updated (Gradually)**
   ```bash
   # Monthly security patches
   npm audit fix --only=prod

   # Quarterly minor updates
   npm update --save

   # Annual major updates (with full testing)
   # Plan 1-2 week testing period
   ```

---

## 📊 MAINTENANCE METRICS

### Track These KPIs

| Metric | Target | Alert Threshold | Action |
|--------|--------|-----------------|--------|
| Uptime | 99.9% | <99.5% | Investigate immediately |
| Response Time | <500ms | >1000ms | Performance audit |
| Error Rate | <1% | >5% | Code review |
| Form Submissions | [baseline] | <80% of baseline | Check webhook |
| Security Incidents | 0 | Any | Security review |

**Monthly Report Template:**
```markdown
# Monthly Maintenance Report - [Month Year]

## Uptime
- Achieved: XX.X%
- Target: 99.9%
- Incidents: [list any downtime]

## Performance
- Avg Response Time: XXms
- P95 Response Time: XXms
- Error Rate: X.X%

## Security
- Vulnerabilities Fixed: X
- Security Incidents: X
- Audit Findings: [summary]

## Changes
- Dependencies Updated: X
- Bug Fixes: X
- Features Added: X

## Action Items
- [ ] [Item 1]
- [ ] [Item 2]
```

---

## 🔄 CHANGE MANAGEMENT PROCESS

### Making Safe Changes

**1. Plan**
```markdown
# Change Request
**What:** [Description]
**Why:** [Reason]
**Risk:** [Low/Medium/High]
**Rollback Plan:** [Steps]
**Testing:** [How to verify]
```

**2. Test in Staging**
```bash
# Create staging environment
git checkout -b staging/[change-name]

# Deploy to staging
npm run build
# Deploy to staging server

# Test thoroughly
# - Manual testing
# - Automated tests (if available)
# - User acceptance testing
```

**3. Deploy to Production**
```bash
# Merge to main
git checkout main
git merge staging/[change-name]

# Tag release
git tag -a v1.x.x -m "Release notes"

# Deploy
npm run build
pm2 reload illummaa

# Monitor for 24 hours
```

---

## 📞 SUPPORT & ESCALATION

### When to Get Help

**Get Help Immediately If:**
- 🔴 Security breach suspected
- 🔴 Data loss/corruption
- 🔴 Site completely down >15 minutes
- 🔴 Legal compliance violation

**Escalation Path:**
1. Development Team Lead
2. Technical Director/CTO
3. External Support (if available)

**Contact Information:**
```
Primary: [dev-team@email.com]
Emergency: [emergency-phone]
Hosting Support: [hosting-support]
Security Contact: [security@email.com]
```

---

## 📝 MAINTENANCE CHECKLIST

### Quick Reference

**Daily (5 min):**
- [ ] Check health endpoint
- [ ] Review error logs (quick scan)
- [ ] Verify form submissions working

**Weekly (15 min):**
- [ ] Log review (detailed)
- [ ] Run `npm run check`
- [ ] Security audit (`npm audit`)

**Monthly (30 min):**
- [ ] Update security patches
- [ ] Analytics review
- [ ] Backup verification
- [ ] Performance spot check

**Quarterly (2 hours):**
- [ ] Comprehensive testing
- [ ] Documentation update
- [ ] Dependency updates (minor)
- [ ] Legal compliance review
- [ ] Performance audit

**Annually (1 day):**
- [ ] Full system audit
- [ ] Major dependency updates
- [ ] Security penetration test
- [ ] Disaster recovery drill
- [ ] Strategic planning

---

## 🎯 MAINTENANCE SUCCESS CRITERIA

**You're doing well if:**
- ✅ Uptime >99.5%
- ✅ No security incidents
- ✅ User complaints <1/month
- ✅ System health score maintained at 90+
- ✅ All documentation current
- ✅ Backups tested and verified

**Red flags (need attention):**
- 🔴 Uptime <99%
- 🔴 Increasing error rates
- 🔴 Performance degradation
- 🔴 Outdated dependencies (>6 months)
- 🔴 No backups or untested backups

---

**Maintenance Guidelines Version:** 1.0
**Last Review:** October 3, 2025
**Next Review:** January 3, 2026
**Maintained By:** Development Team
