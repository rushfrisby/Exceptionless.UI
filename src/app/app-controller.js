(function () {
  'use strict';

  angular.module('app')
    .controller('App', ['$scope', '$state', '$stateParams', '$window', 'authService', 'billingService', '$ExceptionlessClient', 'filterService', 'hotkeys', 'INTERCOM_APPID', '$intercom', 'locker', 'notificationService', 'organizationService', 'signalRService', 'stateService', 'STRIPE_PUBLISHABLE_KEY', 'SYSTEM_NOTIFICATION_MESSAGE', 'urlService', 'userService', function ($scope, $state, $stateParams, $window, authService, billingService, $ExceptionlessClient, filterService, hotkeys, INTERCOM_APPID, $intercom, locker, notificationService, organizationService, signalRService, stateService, STRIPE_PUBLISHABLE_KEY, SYSTEM_NOTIFICATION_MESSAGE, urlService, userService) {
      var source = 'app.App';
      var _store = locker.driver('local').namespace('app');
      var vm = this;

      function canChangePlan() {
        return !!STRIPE_PUBLISHABLE_KEY && vm.organizations && vm.organizations.length > 0;
      }

      function changePlan(organizationId) {
        if (!STRIPE_PUBLISHABLE_KEY) {
          notificationService.error('Billing is currently disabled.');
          return;
        }

        return billingService.changePlan(organizationId);
      }

      function getFilterUrl(route, type) {
        return urlService.buildFilterUrl({ route: route, projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getDashboardUrl(type) {
        return getFilterUrl('dashboard', type);
      }

      function getSessionDashboardUrl() {
        return urlService.buildFilterUrl({ route: 'dashboard', routePrefix: 'session', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId() });
      }

      function getRecentUrl(type) {
        return getFilterUrl('recent', type);
      }

      function getFrequentUrl(type) {
        return getFilterUrl('frequent', type);
      }

      function getUsersUrl(type) {
        return getFilterUrl('users', type);
      }

      function getNewUrl(type) {
        return getFilterUrl('new', type);
      }

      function getOrganizations() {
        function onSuccess(response) {
          vm.organizations = response.data.plain();
          return response;
        }

        return organizationService.getAll().then(onSuccess);
      }

      function getUser(data) {
        function onSuccess(response) {
          vm.user = response.data.plain();
          $ExceptionlessClient.config.setUserIdentity({ identity: vm.user.email_address, name: vm.user.full_name, data: { user: vm.user }});
          return response;
        }

        if (data && data.type === 'User' && data.deleted && data.id === vm.user.id) {
          notificationService.error('Your user account was deleted. Please create a new account.');
          return authService.logout(true);
        }

        return userService.getCurrentUser().then(onSuccess);
      }

      function getSystemNotificationMessage() {
        return SYSTEM_NOTIFICATION_MESSAGE;
      }

      function hasAdminRole() {
        return userService.hasAdminRole(vm.user);
      }

      function hasSystemNotificationMessage() {
        return !!SYSTEM_NOTIFICATION_MESSAGE;
      }

      var dashboards = ['dashboard', 'frequent', 'new', 'recent', 'users'];
      function isAllMenuActive() {
        for (var dashboard in dashboards) {
          if ($state.includes('app.' + dashboard, $stateParams) ||
            $state.includes('app.project-' + dashboard, $stateParams) ||
            $state.includes('app.organization-' + dashboard, $stateParams)) {
            return true;
          }
        }
        return false;
      }

      function isAdminMenuActive() {
        return $state.includes('app.project.list', $stateParams) ||
          $state.includes('app.organization.list', $stateParams) ||
          $state.includes('app.account.manage', $stateParams) ||
          $state.includes('app.admin.dashboard', $stateParams);
      }

      function isReportsMenuActive() {
        return $state.includes('app.session-dashboard', $stateParams) ||
          $state.includes('app.session-project-dashboard', $stateParams) ||
          $state.includes('app.session-organization-dashboard', $stateParams);
      }

      function isIntercomEnabled() {
        return authService.isAuthenticated() && INTERCOM_APPID;
      }

      function isSmartDevice($window) {
        var ua = $window.navigator.userAgent || $window.navigator.vendor || $window.opera;
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

      function isTypeMenuActive(type) {
        var params = angular.extend({}, $stateParams, { type: type });

        for (var dashboard in dashboards) {
          if ($state.includes('app.type-' + dashboard, params) ||
            $state.includes('app.project-type-' + dashboard, params) ||
            $state.includes('app.organization-type-' + dashboard, params)) {
            return true;
          }
        }
        return false;
      }

      function startSignalR() {
        return signalRService.startDelayed(1000);
      }

      if (!!navigator.userAgent.match(/MSIE/i)) {
        angular.element($window.document.body).addClass('ie');
      }

      if (isSmartDevice($window)) {
        angular.element($window.document.body).addClass('smart');
      }

      function showIntercom() {
        $ExceptionlessClient.submitFeatureUsage(source + '.showIntercom');
        $intercom.showNewMessage();
      }

      function toggleSideNavCollapsed() {
        vm.isSideNavCollapsed = !vm.isSideNavCollapsed;
        _store.put('sideNavCollapsed', vm.isSideNavCollapsed);
      }

      hotkeys.bindTo($scope)
        .add({
          combo: 'f1',
          description: 'Documentation',
          callback: function openDocumention() {
            $ExceptionlessClient.createFeatureUsage(source + '.hotkeys.Documentation').addTags('hotkeys').submit();
            $window.open('https://github.com/exceptionless/Exceptionless/wiki', '_blank');
          }
        });

      $scope.$on('$destroy', signalRService.stop);

      vm.canChangePlan = canChangePlan;
      vm.changePlan = changePlan;
      vm.getDashboardUrl = getDashboardUrl;
      vm.getSessionDashboardUrl = getSessionDashboardUrl;
      vm.getRecentUrl = getRecentUrl;
      vm.getFrequentUrl = getFrequentUrl;
      vm.getUsersUrl = getUsersUrl;
      vm.getNewUrl = getNewUrl;
      vm.getOrganizations = getOrganizations;
      vm.getUser = getUser;
      vm.getSystemNotificationMessage = getSystemNotificationMessage;
      vm.hasAdminRole = hasAdminRole;
      vm.hasSystemNotificationMessage = hasSystemNotificationMessage;
      vm.isAllMenuActive = isAllMenuActive;
      vm.isAdminMenuActive = isAdminMenuActive;
      vm.isReportsMenuActive = isReportsMenuActive;
      vm.isIntercomEnabled = isIntercomEnabled;
      vm.isSideNavCollapsed = _store.get('sideNavCollapsed') === true;
      vm.isTypeMenuActive = isTypeMenuActive;
      vm.organizations = [];
      vm.showIntercom = showIntercom;
      vm.toggleSideNavCollapsed = toggleSideNavCollapsed;
      vm.user = {};

      getUser().then(getOrganizations).then(startSignalR);
    }]);
}());
